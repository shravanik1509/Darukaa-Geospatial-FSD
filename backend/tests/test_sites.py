import uuid


def test_list_sites_geojson(client):
    res = client.get("/api/sites/geojson")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert "features" in data
    assert len(data["features"]) >= 6

    feature = data["features"][0]
    assert feature["type"] == "Feature"
    assert feature["geometry"]["type"] == "Polygon"
    assert "area_hectares" in feature["properties"]
    assert feature["properties"]["area_hectares"] > 0


def test_create_and_delete_site_geospatial(client, admin_headers):
    # First get a valid project ID
    proj_res = client.get("/api/projects")
    project_id = proj_res.json()[0]["id"]

    valid_polygon = {
        "type": "Polygon",
        "coordinates": [
            [
                [-55.10, -3.10],
                [-55.05, -3.10],
                [-55.05, -3.15],
                [-55.10, -3.15],
                [-55.10, -3.10],
            ]
        ],
    }

    site_name = f"Test Polygon Parcel {uuid.uuid4().hex[:6]}"
    res = client.post(
        f"/api/projects/{project_id}/sites",
        headers=admin_headers,
        json={
            "name": site_name,
            "description": "Automated polygon test site",
            "ecosystem_type": "Tropical Moist Forest",
            "geometry": valid_polygon,
        },
    )
    assert res.status_code == 201
    site_data = res.json()
    assert site_data["name"] == site_name
    assert site_data["area_hectares"] > 0
    assert site_data["center_latitude"] is not None
    assert site_data["center_longitude"] is not None
    assert site_data["geometry"]["type"] == "Polygon"

    site_id = site_data["id"]

    # Retrieve site directly
    get_site_res = client.get(f"/api/sites/{site_id}")
    assert get_site_res.status_code == 200
    assert get_site_res.json()["name"] == site_name

    # Delete site
    del_res = client.delete(f"/api/sites/{site_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Ensure 404
    assert client.get(f"/api/sites/{site_id}").status_code == 404


def test_create_site_invalid_unclosed_polygon(client, admin_headers):
    proj_res = client.get("/api/projects")
    project_id = proj_res.json()[0]["id"]

    unclosed_polygon = {
        "type": "Polygon",
        "coordinates": [
            [
                [-55.10, -3.10],
                [-55.05, -3.10],
                [-55.05, -3.15],
                # Missing closing vertex equal to [-55.10, -3.10]
            ]
        ],
    }

    res = client.post(
        f"/api/projects/{project_id}/sites",
        headers=admin_headers,
        json={
            "name": "Invalid Site",
            "ecosystem_type": "Tropical Rainforest",
            "geometry": unclosed_polygon,
        },
    )
    assert res.status_code == 422
    assert "Exterior ring must have at least 4 positions" in str(res.json())
