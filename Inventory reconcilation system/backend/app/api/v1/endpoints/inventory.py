import io
import csv
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from typing import List, Optional, Dict, Any

from backend.app.db.session import get_db
from backend.app.db.models import (
    InventoryItem, ReconciliationResult, Warehouse, Supplier,
    InfrastructureAsset, IoTSensor, Alert, Forecast, AuditLog,
    AgentExecution, InventoryTransaction
)
from backend.app.agents.graph import run_agent_workflow
from backend.app.api.v1.endpoints.auth import get_current_user, RoleChecker

router = APIRouter(prefix="/inventory", tags=["Inventory Operations"])

# Checkers
require_manager = RoleChecker(["Super Admin", "Operations Manager", "Warehouse Manager"])
require_auditor = RoleChecker(["Super Admin", "Auditor", "Operations Manager"])
require_viewer = RoleChecker(["Super Admin", "Operations Manager", "Warehouse Manager", "Auditor", "Analyst", "Viewer"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user = Depends(require_viewer)):
    """Computes high-level Executive Command Center KPI summaries."""
    # 1. Total Inventory Value
    total_val = db.query(func.sum(InventoryItem.physical_quantity * InventoryItem.unit_cost)).scalar() or 0.0
    
    # 2. Total SKU Count
    sku_count = db.query(func.count(InventoryItem.id)).scalar() or 0
    
    # 3. Active Discrepancies count
    active_discrepancies = db.query(func.count(ReconciliationResult.id)).filter(
        ReconciliationResult.status == "PENDING"
    ).scalar() or 0
    
    # 4. Inventory Accuracy
    # Accuracy % = (Items with matching ERP & Physical qty) / Total SKUs * 100
    matched_skus = db.query(func.count(InventoryItem.id)).filter(
        InventoryItem.erp_quantity == InventoryItem.physical_quantity
    ).scalar() or 0
    accuracy = round((matched_skus / sku_count * 100), 2) if sku_count > 0 else 100.0
    
    # 5. Financial Impact of discrepancies
    financial_impact = db.query(func.sum(ReconciliationResult.financial_impact)).filter(
        ReconciliationResult.status == "PENDING"
    ).scalar() or 0.0
    
    # 6. Supplier Overall Health
    avg_quality = db.query(func.avg(Supplier.quality_score)).scalar() or 1.0
    supplier_health = round(avg_quality * 100, 1)
    
    # 7. Infrastructure overall health
    avg_asset_health = db.query(func.avg(InfrastructureAsset.health_score)).scalar() or 1.0
    infra_health = round(avg_asset_health * 100, 1)
    
    return {
        "total_inventory_value": round(total_val, 2),
        "total_skus": sku_count,
        "active_discrepancies": active_discrepancies,
        "accuracy_percent": accuracy,
        "financial_impact": round(financial_impact, 2),
        "supplier_health_index": supplier_health,
        "infrastructure_health_index": infra_health
    }

@router.get("/items")
def list_items(
    page: int = 1,
    limit: int = 50,
    search: Optional[str] = None,
    category: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_viewer)
):
    """Lists SKUs with pagination and search criteria."""
    offset = (page - 1) * limit
    stmt = select(InventoryItem)
    
    if search:
        stmt = stmt.filter(
            or_(
                InventoryItem.sku.like(f"%{search}%"),
                InventoryItem.name.like(f"%{search}%")
            )
        )
    if category:
        stmt = stmt.filter(InventoryItem.category == category)
    if warehouse_id:
        stmt = stmt.filter(InventoryItem.warehouse_id == warehouse_id)
        
    # Count total query records
    total = db.query(func.count()).select_from(stmt.subquery()).scalar()
    
    items = db.execute(stmt.offset(offset).limit(limit)).scalars().all()
    
    result = []
    for item in items:
        result.append({
            "id": item.id,
            "sku": item.sku,
            "name": item.name,
            "description": item.description,
            "category": item.category,
            "unit_cost": item.unit_cost,
            "retail_price": item.retail_price,
            "erp_quantity": item.erp_quantity,
            "wms_quantity": item.wms_quantity,
            "physical_quantity": item.physical_quantity,
            "safety_stock": item.safety_stock,
            "reorder_point": item.reorder_point,
            "warehouse": item.warehouse.name if item.warehouse else None
        })
        
    return {
        "items": result,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/reconciliation")
def get_reconciliations(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_viewer)
):
    """Retrieves reconciliation items matching status."""
    stmt = select(ReconciliationResult)
    if status:
        stmt = stmt.filter(ReconciliationResult.status == status)
    stmt = stmt.order_by(ReconciliationResult.timestamp.desc()).limit(100)
    
    records = db.execute(stmt).scalars().all()
    results = []
    for r in records:
        results.append({
            "id": r.id,
            "run_id": r.run_id,
            "sku": r.item.sku,
            "name": r.item.name,
            "erp_qty": r.erp_qty,
            "wms_qty": r.wms_qty,
            "physical_qty": r.physical_qty,
            "variance": r.variance,
            "financial_impact": r.financial_impact,
            "root_cause": r.root_cause,
            "status": r.status,
            "timestamp": r.timestamp.isoformat()
        })
    return results

@router.post("/reconciliation/run")
def trigger_reconciliation(db: Session = Depends(get_db), current_user = Depends(require_manager)):
    """Triggers the LangGraph Multi-Agent execution loop to scan and fix mismatches."""
    result = run_agent_workflow()
    return {
        "message": "Reconciliation agent workflow run completed.",
        "run_id": result["run_id"],
        "scanned_count": result["items_scanned"],
        "compliance_score": result["compliance_score"],
        "logs": result["logs"],
        "audit_trail": result["audit_trail"]
    }

@router.get("/agents/history")
def get_agents_execution_history(db: Session = Depends(get_db), current_user = Depends(require_viewer)):
    """Lists history of Multi-agent executions, tool usage, and confidence indexes."""
    stmt = select(AgentExecution).order_by(AgentExecution.timestamp.desc()).limit(100)
    runs = db.execute(stmt).scalars().all()
    
    results = []
    for r in runs:
        results.append({
            "id": r.id,
            "run_id": r.run_id,
            "agent_name": r.agent_name,
            "status": r.status,
            "reasoning": r.reasoning,
            "tool_calls": r.tool_calls,
            "confidence": r.confidence,
            "timestamp": r.timestamp.isoformat()
        })
    return results

@router.get("/infrastructure")
def get_infrastructure_assets(db: Session = Depends(get_db), current_user = Depends(require_viewer)):
    """Lists warehouse environment devices (HVACs, coolers) and active telemetry metrics."""
    stmt = select(InfrastructureAsset)
    assets = db.execute(stmt).scalars().all()
    
    results = []
    for a in assets:
        # Load sensors
        sensors = [{"id": s.id, "type": s.type, "value": s.value, "status": s.status} for s in a.sensors]
        results.append({
            "id": a.id,
            "name": a.name,
            "type": a.type,
            "status": a.status,
            "health_score": a.health_score,
            "installation_date": a.installation_date.date().isoformat(),
            "warehouse": a.warehouse.name if a.warehouse else None,
            "sensors": sensors
        })
    return results

@router.get("/suppliers")
def get_suppliers(db: Session = Depends(get_db), current_user = Depends(require_viewer)):
    """Lists supplier partners, showing delay statistics and lead time logs."""
    stmt = select(Supplier).order_by(Supplier.risk_score.asc())
    suppliers = db.execute(stmt).scalars().all()
    
    results = []
    for s in suppliers:
        results.append({
            "id": s.id,
            "name": s.name,
            "code": s.code,
            "contact_email": s.contact_email,
            "delivery_performance": s.delivery_performance,
            "quality_score": s.quality_score,
            "lead_time_days": s.lead_time_days,
            "risk_score": s.risk_score
        })
    return results

@router.get("/forecasts")
def get_forecasts(db: Session = Depends(get_db), current_user = Depends(require_viewer)):
    """Retrieves target demand charts forecasts for inventory replenishments."""
    stmt = select(Forecast).join(InventoryItem).order_by(Forecast.predicted_demand.desc()).limit(100)
    forecasts = db.execute(stmt).scalars().all()
    
    results = []
    for f in forecasts:
        results.append({
            "id": f.id,
            "sku": f.item.sku,
            "name": f.item.name,
            "forecast_date": f.forecast_date.date().isoformat(),
            "predicted_demand": f.predicted_demand,
            "confidence_interval": f.confidence_interval
        })
    return results

@router.get("/alerts")
def get_alerts(db: Session = Depends(get_db), current_user = Depends(require_viewer)):
    """Lists active alerts across warehousing systems."""
    stmt = select(Alert).filter(Alert.status == "ACTIVE").order_by(Alert.timestamp.desc())
    alerts = db.execute(stmt).scalars().all()
    
    results = []
    for a in alerts:
        results.append({
            "id": a.id,
            "severity": a.severity,
            "type": a.type,
            "message": a.message,
            "timestamp": a.timestamp.isoformat(),
            "warehouse": a.warehouse.name if a.warehouse else None
        })
    return results

@router.get("/audit-logs")
def get_audit_logs(db: Session = Depends(get_db), current_user = Depends(require_auditor)):
    """Exposes transaction logs to auditor roles."""
    stmt = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(200)
    logs = db.execute(stmt).scalars().all()
    
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "target_table": l.target_table,
            "target_id": l.target_id,
            "timestamp": l.timestamp.isoformat(),
            "details": l.details
        })
    return results

@router.get("/export")
def export_audit_data(
    format: str = Query("csv", regex="^(csv|excel)$"),
    db: Session = Depends(get_db),
    current_user = Depends(require_auditor)
):
    """Generates streaming CSV reports containing reconciliation ledgers."""
    stmt = select(ReconciliationResult).order_by(ReconciliationResult.timestamp.desc())
    results = db.execute(stmt).scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Record ID", "Run ID", "SKU", "Product Name", 
        "ERP Qty", "WMS Qty", "Physical Qty", "Variance", 
        "Financial Impact ($)", "Root Cause", "Status", "Timestamp"
    ])
    
    for r in results:
        writer.writerow([
            r.id, r.run_id, r.item.sku, r.item.name,
            r.erp_qty, r.wms_qty, r.physical_qty, r.variance,
            r.financial_impact, r.root_cause, r.status, r.timestamp.isoformat()
        ])
        
    output.seek(0)
    
    headers = {
        "Content-Disposition": f"attachment; filename=reconciliation_report_{datetime.now().strftime('%Y%m%d')}.csv"
    }
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers=headers
    )
