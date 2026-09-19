from datetime import UTC, datetime


def test_get_dashboard_summary(client):
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert "total_projects" in data
    assert data["total_projects"] >= 3
    assert data["total_sites"] >= 6
    assert data["total_area_hectares"] > 0
    assert data["total_estimated_carbon"] > 0
    assert data["average_biodiversity_index"] > 0
    assert "projects_by_status" in data
    assert "projects_by_type" in data
    assert len(data["recent_projects"]) > 0


def test_site_analytics_timeseries_and_observation(client, admin_headers):
    # Get a site ID
    sites_res = client.get("/api/sites")
    site_id = sites_res.json()[0]["id"]

    # Get analytics
    analytics_res = client.get(f"/api/sites/{site_id}/analytics")
    assert analytics_res.status_code == 200
    summary = analytics_res.json()
    assert summary["site_id"] == site_id
    assert summary["total_observations"] >= 10
    assert len(summary["records"]) >= 10
    assert summary["carbon_trend"] is not None
    assert summary["biodiversity_trend"] is not None

    # Add a new observation as Admin
    obs_date = datetime(2026, 10, 1, 12, 0, tzinfo=UTC).isoformat()
    add_res = client.post(
        f"/api/sites/{site_id}/analytics",
        headers=admin_headers,
        json={
            "recorded_at": obs_date,
            "carbon_value": 145.2,
            "biodiversity_value": 4.6,
            "vegetation_value": 0.88,
            "canopy_cover_percentage": 92.5,
            "soil_moisture_percentage": 78.0,
        },
    )
    assert add_res.status_code == 201
    obs_data = add_res.json()
    assert obs_data["carbon_value"] == 145.2
    assert obs_data["site_id"] == site_id


def test_health_checks(client):
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_db = client.get("/health/db")
    assert res_db.status_code == 200
    db_data = res_db.json()
    assert db_data["status"] == "healthy"
    assert "postgis_full_version" in db_data
