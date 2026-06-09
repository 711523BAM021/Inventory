# Deployment & Infrastructure Guide

This guide details how to build, run, configure, and debug the multi-service deployment setup.

---

## 1. Single Node Setup (Docker Compose)

The entire microservice system runs under Docker Compose. Follow these verification steps to configure the system:

### Step 1: Copy Environment Template
Create your active environment variables configuration file from the template:
```bash
cp .env.example .env
```

### Step 2: Build and Run
Compile backend packages and bootstrap the frontend container:
```bash
docker-compose up --build -d
```
This runs all services in background daemon mode:
- `db` (Postgres database on port 5432)
- `redis` (Cache layer on port 6379)
- `backend` (FastAPI web server on port 8000)
- `frontend` (Next.js 15 panel on port 3000)
- `prometheus` (Telemetry database on port 9090)
- `grafana` (Metrics visualization dashboard on port 3005)

---

## 2. Infrastructure Troubleshooting Logs

- **View backend server logs:**
```bash
docker-compose logs -f backend
```

- **Verify database state:**
```bash
docker-compose exec db pg_isready -U postgres
```

- **Reset database volumes (drops all data):**
```bash
docker-compose down -v
```
Upon the next container startup, tables are automatically recreated and seeded in full.
