import pytest
from backend.app.core.security import verify_password, get_password_hash

def test_password_hashing():
    pwd = "omnilogistics2026"
    h = get_password_hash(pwd)
    assert verify_password(pwd, h) is True
    assert verify_password("wrong_password", h) is False

def test_auth_signup_and_login(client):
    # Test Signup
    signup_data = {
        "name": "Integration Test Admin",
        "email": "testadmin@omnilogistics.com",
        "password": "testpassword123",
        "role": "Super Admin",
        "organization_name": "Test Org"
      }
    response = client.post("/api/v1/auth/signup", json=signup_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testadmin@omnilogistics.com"
    assert data["role"] == "Super Admin"

    # Test Login
    login_data = {
        "username": "testadmin@omnilogistics.com",
        "password": "testpassword123"
    }
    login_response = client.post("/api/v1/auth/login", data=login_data)
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["role"] == "Super Admin"
