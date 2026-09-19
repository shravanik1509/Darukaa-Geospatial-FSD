import os
import sys

import pytest
from fastapi.testclient import TestClient

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="session")
def admin_token(client):
    res = client.post(
        "/api/auth/login",
        json={"email": "admin@darukaa.earth", "password": "Admin@123456"},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def user_token(client):
    res = client.post(
        "/api/auth/login",
        json={"email": "analyst@darukaa.earth", "password": "Analyst@123456"},
    )
    assert res.status_code == 200
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def user_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}
