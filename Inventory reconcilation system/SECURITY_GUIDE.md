# Security & Compliance Guide

Security policies and implementation patterns integrated into the platform.

---

## 1. Authentication & JWT Signature Policy

- The platform implements **JSON Web Token (JWT)** signatures using the **HS256** algorithm.
- Signature keys are loaded via the `SECRET_KEY` environment parameter.
- Passwords are encrypted using the standard **Bcrypt** cryptographic algorithm, utilizing custom salts generated on the fly.
- Login endpoints enforce JWT bearer token validation on downstream API requests.

---

## 2. Role-Based Access Control (RBAC) Permitted Actions

The system maps authorization scopes to 6 roles:

| Role Name | Permitted API Endpoints | Responsibility |
|---|---|---|
| **Super Admin** | `ALL` | Full system controller |
| **Operations Manager** | Stats, Items, Reconcile, Trigger Run, Alerts, Sensors, Suppliers | Manage day-to-day warehouse operations |
| **Warehouse Manager** | Stats, Items, Reconcile, Alerts, Sensors | Monitor facility-specific stock |
| **Auditor** | Stats, Reconcile, Audit Logs, CSV Export | Review financial discrepancies and export ledgers |
| **Analyst** | Stats, Items, Forecasts, Sensors, Suppliers | Study demand metrics and predict safety margins |
| **Viewer** | Stats, Items, Alerts | Read-only dashboard viewer |

---

## 3. Input Validation & Protection

- **FastAPI Validation:** Pydantic models automatically sanitize incoming JSON parameters.
- **Bcrypt Hashing:** Direct call layers protect credentials and avoid legacy truncation issues.
- **SQLAlchemy ORM Bindings:** Prevent SQL injection vulnerabilities.
