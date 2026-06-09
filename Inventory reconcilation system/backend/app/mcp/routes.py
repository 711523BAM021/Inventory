from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.app.db.session import get_db
from backend.app.db.models import (
    InventoryItem, ReconciliationResult, Supplier, 
    Forecast, IoTSensor, AuditLog
)

router = APIRouter(prefix="/mcp", tags=["MCP Tools"])

# Define input Schemas
class SearchQuery(BaseModel):
    query: str

class ReconQuery(BaseModel):
    run_id: Optional[str] = None

class ForecastQuery(BaseModel):
    sku: str

class InfraQuery(BaseModel):
    sensor_id: Optional[int] = None

class AuditQuery(BaseModel):
    limit: int = 10

@router.get("/tools")
def list_mcp_tools() -> Dict[str, Any]:
    """Returns the Model Context Protocol (MCP) compliance tool catalog."""
    return {
        "tools": [
            {
                "name": "inventory_search",
                "description": "Search inventory catalog by SKU or product name.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "SKU code or name query"}
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "inventory_reconciliation",
                "description": "Retrieve results of inventory reconciliation runs.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "run_id": {"type": "string", "description": "Reconciliation run identifier"}
                    }
                }
            },
            {
                "name": "forecast_analysis",
                "description": "Fetch demand predictions and safety limits for a target SKU.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "sku": {"type": "string", "description": "SKU code"}
                    },
                    "required": ["sku"]
                }
            },
            {
                "name": "infrastructure_health",
                "description": "Query sensor logs and HVAC health indicators.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "sensor_id": {"type": "integer", "description": "ID of telemetry sensor"}
                    }
                }
            },
            {
                "name": "audit_history",
                "description": "Get security auditor action logs.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "limit": {"type": "integer", "description": "Number of logs to return"}
                    }
                }
            }
        ]
    }

@router.post("/inventory_search")
def mcp_inventory_search(payload: SearchQuery, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Execute search query over catalog."""
    query = f"%{payload.query}%"
    stmt = select(InventoryItem).filter(
        or_(
            InventoryItem.sku.like(query),
            InventoryItem.name.like(query)
        )
    ).limit(10)
    
    items = db.execute(stmt).scalars().all()
    results = []
    for item in items:
        results.append({
            "sku": item.sku,
            "name": item.name,
            "erp_qty": item.erp_quantity,
            "wms_qty": item.wms_quantity,
            "physical_qty": item.physical_quantity,
            "unit_cost": item.unit_cost
        })
        
    return {
        "content": [
            {
                "type": "text",
                "text": f"Found {len(results)} matching products. Results: {results}"
            }
        ]
    }

@router.post("/reconciliation")
def mcp_reconciliation(payload: ReconQuery, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Execute reconciliation analysis query."""
    stmt = select(ReconciliationResult)
    if payload.run_id:
        stmt = stmt.filter(ReconciliationResult.run_id == payload.run_id)
    stmt = stmt.limit(20)
    
    results = db.execute(stmt).scalars().all()
    output = []
    for res in results:
        output.append({
            "sku": res.item.sku,
            "erp_qty": res.erp_qty,
            "wms_qty": res.wms_qty,
            "physical_qty": res.physical_qty,
            "variance": res.variance,
            "impact": res.financial_impact,
            "root_cause": res.root_cause
        })
        
    return {
        "content": [
            {
                "type": "text",
                "text": f"Reconciliation records: {output}"
            }
        ]
    }

@router.post("/forecast")
def mcp_forecast(payload: ForecastQuery, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Expose forecasts over individual SKUs."""
    stmt = select(Forecast).join(InventoryItem).filter(InventoryItem.sku == payload.sku)
    forecast = db.execute(stmt).scalars().first()
    
    if not forecast:
        return {
            "content": [
                {
                    "type": "text",
                    "text": f"No forecast targets identified for SKU {payload.sku}."
                }
            ]
        }
        
    return {
        "content": [
            {
                "type": "text",
                "text": f"SKU {payload.sku} predicted demand: {forecast.predicted_demand} on {forecast.forecast_date} with confidence {forecast.confidence_interval}."
            }
        ]
    }

@router.post("/infrastructure")
def mcp_infrastructure(payload: InfraQuery, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Provide sensor telemetry logs."""
    stmt = select(IoTSensor)
    if payload.sensor_id:
        stmt = stmt.filter(IoTSensor.id == payload.sensor_id)
    stmt = stmt.limit(10)
    
    sensors = db.execute(stmt).scalars().all()
    output = [{"sensor_id": s.id, "type": s.type, "value": s.value, "status": s.status} for s in sensors]
    
    return {
        "content": [
            {
                "type": "text",
                "text": f"Telemetry reports: {output}"
            }
        ]
    }

@router.post("/audit")
def mcp_audit(payload: AuditQuery, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Expose recent system audits."""
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(payload.limit)
    logs = db.execute(stmt).scalars().all()
    output = [{"timestamp": l.timestamp.isoformat(), "action": l.action, "details": l.details} for l in logs]
    
    return {
        "content": [
            {
                "type": "text",
                "text": f"Recent Audit Records: {output}"
            }
        ]
    }
