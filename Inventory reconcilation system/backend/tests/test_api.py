import pytest

@pytest.fixture(scope="function")
def authorized_headers(client):
    # Log in as admin
    login_data = {
        "username": "ops@omnilogistics.com",
        "password": "omnilogistics2026"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_get_dashboard_stats(client, authorized_headers):
    response = client.get("/api/v1/inventory/stats", headers=authorized_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_inventory_value" in data
    assert "accuracy_percent" in data
    assert "active_discrepancies" in data

def test_list_inventory_items(client, authorized_headers):
    response = client.get("/api/v1/inventory/items?limit=5", headers=authorized_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) <= 5

def test_get_infrastructure_sensors(client, authorized_headers):
    response = client.get("/api/v1/inventory/infrastructure", headers=authorized_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 0

def test_export_reconciliation_csv(client, authorized_headers):
    response = client.get("/api/v1/inventory/export?format=csv", headers=authorized_headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert "attachment; filename=reconciliation_report_" in response.headers["content-disposition"]
