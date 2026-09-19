"""Geospatial utilities for GeoJSON validation, Shapely transformations, and PostGIS conversions."""

import json
from typing import Any

from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Polygon, mapping, shape


def geojson_to_shapely(geojson_dict: dict[str, Any]) -> Polygon:
    """Convert a GeoJSON Polygon dictionary to a validated Shapely Polygon object."""
    geom = shape(geojson_dict)
    if not isinstance(geom, Polygon):
        raise ValueError(f"Expected Polygon geometry, but got {type(geom).__name__}")
    if not geom.is_valid:
        # Attempt buffering to fix minor self-intersections or topology errors
        geom = geom.buffer(0)
        if not geom.is_valid:
            raise ValueError("Invalid polygon geometry: self-intersecting or degenerate.")
    return geom


def shapely_to_geoalchemy(geom: Polygon, srid: int = 4326):
    """Convert a Shapely Polygon into a GeoAlchemy2 WKBElement with given SRID."""
    return from_shape(geom, srid=srid)


def geoalchemy_to_geojson(wkb_element) -> dict[str, Any]:
    """Convert a GeoAlchemy2 WKBElement or geometry column value to GeoJSON dict."""
    if wkb_element is None:
        return {}
    try:
        shapely_geom = to_shape(wkb_element)
        return mapping(shapely_geom)
    except Exception:
        # If it's already a WKT string or json
        if isinstance(wkb_element, (dict, list)):
            return wkb_element
        if isinstance(wkb_element, str):
            try:
                return json.loads(wkb_element)
            except Exception:
                pass
        return {}


def calculate_centroid(geom: Polygon) -> tuple[float, float]:
    """Calculate the (latitude, longitude) centroid of a Polygon."""
    centroid = geom.centroid
    return round(centroid.y, 6), round(centroid.x, 6)
