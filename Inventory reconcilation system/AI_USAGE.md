# AI Multi-Agent & MCP Tool Guidelines

This document details the reasoning models, tool configurations, and execution scopes of the AI layer.

---

## 1. Multi-Agent System Node Details

The system executes a custom directed-graph workflow representing a LangGraph flow.

### Reconciliation Agent Node
- **Inputs:** Database item quantities.
- **Responsibilities:** Scans SKU inventories. Identifies records where `erp_quantity != physical_quantity` or `wms_quantity != physical_quantity`.
- **Calculations:**
  - `variance = erp_quantity - physical_quantity`
  - `financial_impact = variance * unit_cost`

### Root Cause Agent Node
- **Inputs:** Flagged mismatches from the Reconciliation node.
- **Responsibilities:** Audits recent goods receipts and stock transfers. Pinpoints handling damages, rack misplacements, or shipping lags. Assigns confidence ratings to its findings.

### Supplier Intelligence Agent Node
- **Inputs:** Supplier statistics associated with mismatched SKUs.
- **Responsibilities:** Measures quality performance scores and predicts procurement delay probabilities.

---

## 2. Model Context Protocol (MCP) Tool Specifications

The MCP server layer allows external LLM agents (using tools) to query backend operational data.

### Available MCP Tool Catalog:

1. **`inventory_search`**
   - **Arguments:** `{ query: "SKU or Name" }`
   - **Action:** Returns matching SKU levels and warehouse locations.

2. **`inventory_reconciliation`**
   - **Arguments:** `{ run_id: "Optional Run ID" }`
   - **Action:** Lists stock variance findings.

3. **`forecast_analysis`**
   - **Arguments:** `{ sku: "SKU Code" }`
   - **Action:** Pulls weekly demand predictions.

4. **`infrastructure_health`**
   - **Arguments:** `{ sensor_id: "Optional Sensor ID" }`
   - **Action:** Reads HVAC temperature alarms.
