# AI-Powered Multi-Agent Inventory Reconciliation & Infrastructure Intelligence Platform

An industrial-grade, Fortune-500-ready SaaS platform built to autonomously reconcile warehouse stocks, pinpoint transaction discrepancies, evaluate supplier delay statistics, and process HVAC sensor telemetry feeds.

---

## 🚀 Quick Start (Instant Launch)

You can launch the entire stack (Database, Cache, FastAPI, Next.js, Prometheus, and Grafana) with a single command:

```bash
docker-compose up --build
```

### Access Ports:
- **Next.js Frontend:** [http://localhost:3000](http://localhost:3000)
- **FastAPI API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Prometheus Dashboard:** [http://localhost:9090](http://localhost:9090)
- **Grafana Metrics Mapping:** [http://localhost:3005](http://localhost:3005) (Admin Pass: `admin`)

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** Next.js 15 App Router, TypeScript, Tailwind CSS, Recharts, Zustand.
- **Backend:** FastAPI, Python 3.12, SQLAlchemy 2.0, PostgreSQL, Redis.
- **AI Agent Orchestration:** LangGraph (StateGraph), LangChain tools, Gemini 2.5 Pro / GPT-4o.
- **Observability:** Prometheus & Grafana telemetry scrapers.

---

## 📂 Repository Directory Layout

- `backend/` - FastAPI, SQLAlchemy models, seeder scripts, REST endpoints.
- `backend/app/agents/` - Multi-Agent LangGraph flow structures.
- `backend/app/mcp/` - Model Context Protocol (MCP) tool bindings.
- `frontend/` - Next.js 15 app screens, Recharts custom panels.
- `infrastructure/` - Prometheus YAML mapping rules.
- `docs/` - Comprehensive technical architecture guides.
