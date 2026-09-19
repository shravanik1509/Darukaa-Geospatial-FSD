"""Realistic Demonstration Seed Data Script for Darukaa.Earth Platform.

This script populates the database with:
- Standard Administrator and Analyst user accounts
- Realistic global conservation projects (Amazon, Sundarbans, Scottish Highlands)
- Precise geographical polygon sites with valid WGS84 coordinates
- Rich multi-year time-series environmental observations for Chart.js visualization
"""

from datetime import date, datetime, timezone, timedelta
import os
import sys
import uuid
import json

# Ensure project root and backend are in python path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from sqlalchemy import text
from app.core.config import settings
from app.core.security import get_password_hash
from app.database.session import SessionLocal
from app.models import User, Project, Site, SiteAnalytics
from app.utils.geo import geojson_to_shapely, shapely_to_geoalchemy, calculate_centroid


# Realistic Polygons for Global Conservation Sites (WGS84 Lon/Lat)
AMAZON_SITE_1 = {
    "type": "Polygon",
    "coordinates": [
        [
            [-54.980, -3.220],
            [-54.950, -3.210],
            [-54.935, -3.245],
            [-54.965, -3.265],
            [-54.995, -3.240],
            [-54.980, -3.220],
        ]
    ],
}

AMAZON_SITE_2 = {
    "type": "Polygon",
    "coordinates": [
        [
            [-54.910, -3.280],
            [-54.880, -3.270],
            [-54.865, -3.310],
            [-54.895, -3.330],
            [-54.925, -3.305],
            [-54.910, -3.280],
        ]
    ],
}

SUNDARBANS_SITE_1 = {
    "type": "Polygon",
    "coordinates": [
        [
            [88.820, 22.140],
            [88.860, 22.155],
            [88.875, 22.120],
            [88.835, 22.100],
            [88.805, 22.115],
            [88.820, 22.140],
        ]
    ],
}

SUNDARBANS_SITE_2 = {
    "type": "Polygon",
    "coordinates": [
        [
            [88.750, 22.080],
            [88.790, 22.095],
            [88.810, 22.065],
            [88.775, 22.045],
            [88.740, 22.060],
            [88.750, 22.080],
        ]
    ],
}

SCOTTISH_SITE_1 = {
    "type": "Polygon",
    "coordinates": [
        [
            [-4.850, 57.320],
            [-4.810, 57.335],
            [-4.795, 57.305],
            [-4.835, 57.285],
            [-4.865, 57.300],
            [-4.850, 57.320],
        ]
    ],
}

SCOTTISH_SITE_2 = {
    "type": "Polygon",
    "coordinates": [
        [
            [-4.750, 57.260],
            [-4.710, 57.275],
            [-4.695, 57.240],
            [-4.735, 57.225],
            [-4.765, 57.240],
            [-4.750, 57.260],
        ]
    ],
}


def clear_existing_data(db):
    """Cleanly purge demo data in reverse dependency order."""
    print("Purging existing demonstration records...")
    db.query(SiteAnalytics).delete()
    db.query(Site).delete()
    db.query(Project).delete()
    db.query(User).filter(User.email.in_(["admin@darukaa.earth", "analyst@darukaa.earth"])).delete()
    db.commit()


def seed_database():
    db = SessionLocal()
    try:
        clear_existing_data(db)

        # 1. Seed Users
        print("Seeding demo users...")
        admin_user = User(
            id=uuid.uuid4(),
            name="Darukaa Administrator",
            email="admin@darukaa.earth",
            password_hash=get_password_hash("Admin@123456"),
            role="ADMIN",
            is_active=True,
        )
        analyst_user = User(
            id=uuid.uuid4(),
            name="Environmental Field Analyst",
            email="analyst@darukaa.earth",
            password_hash=get_password_hash("Analyst@123456"),
            role="USER",
            is_active=True,
        )
        db.add_all([admin_user, analyst_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(analyst_user)

        # 2. Seed Projects
        print("Seeding conservation projects...")
        projects_data = [
            {
                "id": uuid.uuid4(),
                "name": "Amazon Agroforestry & Biodiversity Corridor",
                "description": (
                    "Large-scale tropical canopy restoration and regenerative agroforestry "
                    "across degraded cattle pasturelands in Pará, Brazil. Re-establishes wildlife "
                    "corridors while generating sustainable acai and cacao livelihoods."
                ),
                "project_type": "Agroforestry",
                "status": "Active",
                "start_date": date(2023, 1, 15),
                "end_date": date(2035, 12, 31),
                "target_carbon_offset": 85000.0,
                "created_by": admin_user.id,
                "sites": [
                    {
                        "name": "Tapajós River Canopy Restoration Zone",
                        "description": "Primary agroforestry parcel integrating high-density native legumes and Inga edulis shade trees.",
                        "ecosystem_type": "Tropical Rainforest",
                        "polygon": AMAZON_SITE_1,
                        "analytics_start_carbon": 34.2,
                        "analytics_growth_rate": 1.08,
                        "start_bio": 2.2,
                        "start_ndvi": 0.42,
                    },
                    {
                        "name": "Jamanxim Wildlife Buffer Corridor",
                        "description": "Ecological connectivity strip connecting two pristine primary terra firme forest patches.",
                        "ecosystem_type": "Tropical Moist Forest",
                        "polygon": AMAZON_SITE_2,
                        "analytics_start_carbon": 28.5,
                        "analytics_growth_rate": 1.07,
                        "start_bio": 2.6,
                        "start_ndvi": 0.48,
                    },
                ],
            },
            {
                "id": uuid.uuid4(),
                "name": "Sundarbans Mangrove Blue Carbon Initiative",
                "description": (
                    "Tidal mangrove afforestation protecting cyclone-vulnerable coastal deltas "
                    "while sequestering deep sediment blue carbon in the Bay of Bengal. Planted with "
                    "Rhizophora mucronata and Avicennia marina."
                ),
                "project_type": "Mangrove Restoration",
                "status": "Active",
                "start_date": date(2023, 6, 1),
                "end_date": date(2033, 5, 31),
                "target_carbon_offset": 120000.0,
                "created_by": admin_user.id,
                "sites": [
                    {
                        "name": "Gosaba Delta Mangrove Parcel",
                        "description": "Tidal flat mud zone with established 3-year mangrove sapling canopy and mudskipper re-colonization.",
                        "ecosystem_type": "Coastal Mangrove",
                        "polygon": SUNDARBANS_SITE_1,
                        "analytics_start_carbon": 55.0,
                        "analytics_growth_rate": 1.06,
                        "start_bio": 2.8,
                        "start_ndvi": 0.52,
                    },
                    {
                        "name": "Matla Estuary Tidal Buffer",
                        "description": "Saline intrusion mitigation barrier protecting inland freshwater aquaculture ponds.",
                        "ecosystem_type": "Estuarine Mangrove Wetland",
                        "polygon": SUNDARBANS_SITE_2,
                        "analytics_start_carbon": 48.0,
                        "analytics_growth_rate": 1.065,
                        "start_bio": 2.5,
                        "start_ndvi": 0.49,
                    },
                ],
            },
            {
                "id": uuid.uuid4(),
                "name": "Scottish Highlands Native Woodland Afforestation",
                "description": (
                    "Restoring historic Caledonian pinewoods, downy birch, and peatland fringes "
                    "in Inverness-shire to revive red squirrel, capercaillie, and wildcat habitat."
                ),
                "project_type": "Afforestation",
                "status": "Active",
                "start_date": date(2024, 3, 1),
                "end_date": date(2044, 2, 28),
                "target_carbon_offset": 45000.0,
                "created_by": analyst_user.id,
                "sites": [
                    {
                        "name": "Glen Affric Pinewood Expansion",
                        "description": "Scots pine and sessile oak regeneration along southern hillside slopes.",
                        "ecosystem_type": "Temperate Conifer Woodland",
                        "polygon": SCOTTISH_SITE_1,
                        "analytics_start_carbon": 22.0,
                        "analytics_growth_rate": 1.05,
                        "start_bio": 1.9,
                        "start_ndvi": 0.38,
                    },
                    {
                        "name": "Strathglass Peatland & Moorland Buffer",
                        "description": "Rewetted Sphagnum bog parcel preventing peat oxidation and methane degassing.",
                        "ecosystem_type": "Peatland & Moorland",
                        "polygon": SCOTTISH_SITE_2,
                        "analytics_start_carbon": 38.0,
                        "analytics_growth_rate": 1.03,
                        "start_bio": 2.1,
                        "start_ndvi": 0.44,
                    },
                ],
            },
        ]

        total_sites_count = 0
        total_observations_count = 0

        for p_data in projects_data:
            project = Project(
                id=p_data["id"],
                name=p_data["name"],
                description=p_data["description"],
                project_type=p_data["project_type"],
                status=p_data["status"],
                start_date=p_data["start_date"],
                end_date=p_data["end_date"],
                target_carbon_offset=p_data["target_carbon_offset"],
                created_by=p_data["created_by"],
            )
            db.add(project)
            db.commit()

            for s_data in p_data["sites"]:
                # Convert polygon GeoJSON
                shapely_poly = geojson_to_shapely(s_data["polygon"])
                geo_wkb = shapely_to_geoalchemy(shapely_poly, srid=4326)
                lat, lng = calculate_centroid(shapely_poly)

                # Compute geodetic area in hectares using PostGIS
                geom_json_str = json.dumps(s_data["polygon"])
                area_res = db.execute(
                    text("SELECT ST_Area(ST_SetSRID(ST_GeomFromGeoJSON(:geom), 4326)::geography) / 10000.0"),
                    {"geom": geom_json_str},
                ).scalar()
                area_ha = round(float(area_res) if area_res else 150.0, 2)

                site_id = uuid.uuid4()
                site = Site(
                    id=site_id,
                    project_id=project.id,
                    name=s_data["name"],
                    description=s_data["description"],
                    ecosystem_type=s_data["ecosystem_type"],
                    area_hectares=area_ha,
                    center_latitude=lat,
                    center_longitude=lng,
                    geometry=geo_wkb,
                )
                db.add(site)
                db.commit()
                total_sites_count += 1

                # Generate 10 consecutive quarters of time-series environmental records (2024 - 2026)
                base_carbon = s_data["analytics_start_carbon"]
                growth = s_data["analytics_growth_rate"]
                bio_base = s_data["start_bio"]
                ndvi_base = s_data["start_ndvi"]

                start_timestamp = datetime(2024, 1, 15, 10, 0, tzinfo=timezone.utc)

                for step in range(10):
                    obs_date = start_timestamp + timedelta(days=step * 90)
                    # Progressive environmental improvements
                    carbon_val = round(base_carbon * (growth ** step), 2)
                    # Biodiversity increases with saturation
                    bio_val = round(min(4.85, bio_base + (step * 0.22) + ((step % 2) * 0.05)), 2)
                    # NDVI seasonal wave with upward baseline trend
                    seasonal_effect = 0.04 if (step % 4 in [1, 2]) else -0.02
                    ndvi_val = round(min(0.92, max(0.15, ndvi_base + (step * 0.035) + seasonal_effect)), 3)
                    canopy = round(min(94.0, 35.0 + (step * 5.2)), 1)
                    moisture = round(min(85.0, 48.0 + ((step % 3) * 6.5)), 1)

                    analytics_record = SiteAnalytics(
                        id=uuid.uuid4(),
                        site_id=site.id,
                        recorded_at=obs_date,
                        carbon_value=carbon_val,
                        biodiversity_value=bio_val,
                        vegetation_value=ndvi_val,
                        canopy_cover_percentage=canopy,
                        soil_moisture_percentage=moisture,
                    )
                    db.add(analytics_record)
                    total_observations_count += 1

                db.commit()

        print(f"Database seeded successfully!")
        print(f"Projects seeded: {len(projects_data)}")
        print(f"Geospatial Sites seeded: {total_sites_count}")
        print(f"Analytics Time-Series observations: {total_observations_count}")
        print("\n--- Demo User Credentials ---")
        print("Administrator : admin@darukaa.earth / Admin@123456 (Full Access)")
        print("Analyst       : analyst@darukaa.earth / Analyst@123456 (Read/Observe)")
        print("-----------------------------\n")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
