import uuid


def test_login_success(client):
    res = client.post(
        "/api/auth/login",
        json={"email": "admin@darukaa.earth", "password": "Admin@123456"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@darukaa.earth"
    assert data["user"]["role"] == "ADMIN"


def test_login_invalid_password(client):
    res = client.post(
        "/api/auth/login",
        json={"email": "admin@darukaa.earth", "password": "WrongPassword!"},
    )
    assert res.status_code == 401
    assert "Incorrect email or password" in res.json()["detail"]


def test_get_current_user_me(client, admin_headers):
    res = client.get("/api/auth/me", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "admin@darukaa.earth"
    assert data["role"] == "ADMIN"


def test_get_current_user_unauthorized(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_register_new_user(client):
    random_email = f"test_{uuid.uuid4().hex[:8]}@darukaa.earth"
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Integration Test User",
            "email": random_email,
            "password": "SecurePassword123!",
            "role": "USER",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == random_email
    assert data["user"]["role"] == "USER"
