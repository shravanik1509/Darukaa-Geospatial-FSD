import uuid


def test_list_projects(client):
    res = client.get("/api/projects")
    assert res.status_code == 200
    projects = res.json()
    assert isinstance(projects, list)
    assert len(projects) >= 3
    # Check that aggregated stats are returned
    assert "total_sites" in projects[0]
    assert "total_area_hectares" in projects[0]


def test_create_and_delete_project_admin(client, admin_headers):
    unique_name = f"Test Rainforest Project {uuid.uuid4().hex[:6]}"
    res = client.post(
        "/api/projects",
        headers=admin_headers,
        json={
            "name": unique_name,
            "description": "A protected biodiversity zone test",
            "project_type": "Reforestation",
            "status": "Planning",
            "target_carbon_offset": 15000.0,
        },
    )
    assert res.status_code == 201
    created = res.json()
    assert created["name"] == unique_name
    assert created["status"] == "Planning"
    proj_id = created["id"]

    # Read project
    get_res = client.get(f"/api/projects/{proj_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == proj_id

    # Update project
    up_res = client.put(
        f"/api/projects/{proj_id}",
        headers=admin_headers,
        json={"status": "Active"},
    )
    assert up_res.status_code == 200
    assert up_res.json()["status"] == "Active"

    # Delete project
    del_res = client.delete(f"/api/projects/{proj_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Ensure 404
    assert client.get(f"/api/projects/{proj_id}").status_code == 404


def test_create_project_forbidden_for_standard_user(client, user_headers):
    res = client.post(
        "/api/projects",
        headers=user_headers,
        json={
            "name": "Unauthorized Project Attempt",
            "project_type": "Reforestation",
            "status": "Active",
        },
    )
    assert res.status_code == 403
    assert "Administrative privileges" in res.json()["detail"]
