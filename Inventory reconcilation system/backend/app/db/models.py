from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.db.session import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    warehouses = relationship("Warehouse", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Super Admin, Operations Manager, Warehouse Manager, Auditor, Analyst, Viewer
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    location = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)  # in pallet slots
    throughput = Column(Integer, default=0)    # items handled daily
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="warehouses")
    items = relationship("InventoryItem", back_populates="warehouse")
    assets = relationship("InfrastructureAsset", back_populates="warehouse")
    alerts = relationship("Alert", back_populates="warehouse")

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, index=True, nullable=False)
    unit_cost = Column(Float, nullable=False)
    retail_price = Column(Float, nullable=False)
    erp_quantity = Column(Integer, nullable=False, default=0)
    wms_quantity = Column(Integer, nullable=False, default=0)
    physical_quantity = Column(Integer, nullable=False, default=0)
    safety_stock = Column(Integer, nullable=False, default=10)
    reorder_point = Column(Integer, nullable=False, default=20)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    warehouse = relationship("Warehouse", back_populates="items")
    transactions = relationship("InventoryTransaction", back_populates="item")
    reconciliation_results = relationship("ReconciliationResult", back_populates="item")
    forecasts = relationship("Forecast", back_populates="item")

class InventoryTransaction(Base):
    __tablename__ = "inventory_transactions"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    type = Column(String, nullable=False)  # IN, OUT, TRANSFER, RECONCILE
    quantity = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    reference_id = Column(String, nullable=True)
    details = Column(String, nullable=True)

    item = relationship("InventoryItem", back_populates="transactions")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    contact_email = Column(String, nullable=False)
    delivery_performance = Column(Float, default=1.0)  # On-time rate 0.0 - 1.0
    quality_score = Column(Float, default=1.0)         # Score 0.0 - 1.0
    lead_time_days = Column(Integer, default=5)
    risk_score = Column(Float, default=0.0)             # Score 0.0 - 1.0
    created_at = Column(DateTime, default=datetime.utcnow)

    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    order_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=False)  # DRAFT, SENT, PARTIAL, COMPLETED, CANCELLED
    total_amount = Column(Float, nullable=False)

    supplier = relationship("Supplier", back_populates="purchase_orders")
    goods_receipts = relationship("GoodsReceipt", back_populates="purchase_order")

class GoodsReceipt(Base):
    __tablename__ = "goods_receipts"

    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    receipt_date = Column(DateTime, default=datetime.utcnow)
    received_qty = Column(Integer, nullable=False)
    status = Column(String, nullable=False)  # ACCEPETED, REJECTED, QUARANTINED

    purchase_order = relationship("PurchaseOrder", back_populates="goods_receipts")

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    origin_warehouse_id = Column(Integer, nullable=False)
    dest_warehouse_id = Column(Integer, nullable=False)
    shipment_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=False)  # IN_TRANSIT, DELIVERED, DELAYED

class InfrastructureAsset(Base):
    __tablename__ = "infrastructure_assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # HVAC, Cold Storage, Forklift, Conveyor Belt
    status = Column(String, nullable=False)  # OPERATIONAL, MAINTENANCE, FAILED
    health_score = Column(Float, default=1.0)
    installation_date = Column(DateTime, default=datetime.utcnow)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)

    warehouse = relationship("Warehouse", back_populates="assets")
    sensors = relationship("IoTSensor", back_populates="asset")

class IoTSensor(Base):
    __tablename__ = "iot_sensors"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("infrastructure_assets.id"), nullable=False)
    type = Column(String, nullable=False)  # Temperature, Humidity, Vibration
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(String, default="OK")  # OK, WARNING, ERROR

    asset = relationship("InfrastructureAsset", back_populates="sensors")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String, nullable=False)  # Info, Warning, Critical
    type = Column(String, nullable=False)      # Inventory, Infrastructure, Supplier
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    status = Column(String, default="ACTIVE")   # ACTIVE, RESOLVED
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True)

    warehouse = relationship("Warehouse", back_populates="alerts")

class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    forecast_date = Column(DateTime, nullable=False)
    predicted_demand = Column(Float, nullable=False)
    confidence_interval = Column(Float, default=0.95)

    item = relationship("InventoryItem", back_populates="forecasts")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String, nullable=False)
    target_table = Column(String, nullable=False)
    target_id = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    details = Column(String, nullable=True)

class AgentExecution(Base):
    __tablename__ = "agent_executions"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, index=True, nullable=False)
    agent_name = Column(String, nullable=False)  # Reconciliation, RootCause, Forecast, Supplier, Infrastructure, Audit
    status = Column(String, nullable=False)      # RUNNING, COMPLETED, FAILED
    reasoning = Column(Text, nullable=True)
    tool_calls = Column(JSON, nullable=True)
    confidence = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

class ReconciliationResult(Base):
    __tablename__ = "reconciliation_results"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, index=True, nullable=False)
    item_id = Column(Integer, ForeignKey("inventory_items.id"), nullable=False)
    erp_qty = Column(Integer, nullable=False)
    wms_qty = Column(Integer, nullable=False)
    physical_qty = Column(Integer, nullable=False)
    variance = Column(Integer, nullable=False)
    financial_impact = Column(Float, nullable=False)
    root_cause = Column(String, nullable=True)
    status = Column(String, default="PENDING")  # PENDING, RESOLVING, RESOLVED
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    item = relationship("InventoryItem", back_populates="reconciliation_results")
