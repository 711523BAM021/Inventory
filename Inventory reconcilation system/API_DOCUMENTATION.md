# REST API Documentation

The platform API runs by default at `http://localhost:8000/api/v1`. 

---

## 1. Authentication Endpoints

### User Signup
- **Method / Path:** `POST /auth/signup`
- **Request Body (JSON):**
```json
{
  "name": "Ops Manager",
  "email": "ops@omnilogistics.com",
  "password": "omnilogistics2026",
  "role": "Operations Manager",
  "organization_name": "Omni Logistics Inc."
}
```
- **Response (200 OK):** Renders user profile metadata.

### User Login
- **Method / Path:** `POST /auth/login`
- **Request Body (Form URL Encoded):**
  - `username`: Email address
  - `password`: Password
- **Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "role": "Operations Manager"
}
```

---

## 2. Inventory & Reconciliation Endpoints

### Executive Command Center KPIs
- **Method / Path:** `GET /inventory/stats`
- **Auth Required:** Bearer Token
- **Response (200 OK):**
```json
{
  "total_inventory_value": 48592100.00,
  "total_skus": 100000,
  "active_discrepancies": 34,
  "accuracy_percent": 98.45,
  "financial_impact": 184500.00,
  "supplier_health_index": 92.4,
  "infrastructure_health_index": 96.8
}
```

### Trigger Reconciliation Agent Run
- **Method / Path:** `POST /inventory/reconciliation/run`
- **Auth Required:** Bearer Token (Super Admin/Operations Manager role)
- **Response (200 OK):** Triggers the LangGraph agents loop and returns run logs.

---

## 3. Model Context Protocol (MCP) Endpoints

- **Get MCP Tool Catalog:** `GET /mcp/tools`
- **Query SKU level:** `POST /mcp/inventory_search` (JSON: `{ "query": "COLD-100" }`)
- **Query Telemetry Sensors:** `POST /mcp/infrastructure` (JSON: `{ "sensor_id": 1 }`)
