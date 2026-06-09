import time
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import insert
from backend.app.core.config import settings
from backend.app.core.security import get_password_hash
from backend.app.db.session import engine, SessionLocal, Base
from backend.app.db.models import (
    Organization, User, Warehouse, Supplier, InventoryItem, 
    InventoryTransaction, PurchaseOrder, GoodsReceipt, Shipment, 
    InfrastructureAsset, IoTSensor, Alert, Forecast, AuditLog, 
    AgentExecution, ReconciliationResult
)

def get_real_sku_data(index: int):
    # Generates realistic SKU metadata
    categories = ["Electronics", "Medical Cold Chain", "Automotive Parts", "Industrial Consumables", "Chemical Reagents"]
    prefixes = ["ELEC", "COLD", "AUTO", "IND", "CHEM"]
    
    cat_idx = index % len(categories)
    category = categories[cat_idx]
    prefix = prefixes[cat_idx]
    
    sku_num = 100000 + index
    sku = f"{prefix}-{sku_num}"
    
    adjectives = ["Precision", "Ultra", "Thermal", "Heavy-Duty", "Standard", "High-Flow", "Secured"]
    nouns = ["Sensor", "Valve", "Controller", "Module", "Switch", "Connector", "Fluid-Pack"]
    
    name = f"{random.choice(adjectives)} {random.choice(nouns)} v{index % 10 + 1}"
    cost = round(random.uniform(5.0, 450.0), 2)
    retail = round(cost * random.uniform(1.25, 1.85), 2)
    
    return sku, name, category, cost, retail

def seed_database(db_session: Optional[Session] = None, bind_engine = None, limit_for_demo: bool = False):
    print("Initializing database tables...")
    active_engine = bind_engine if bind_engine is not None else engine
    Base.metadata.create_all(bind=active_engine)
    
    db = db_session if db_session is not None else SessionLocal()
    close_db = db_session is None
    
    # Check if data already exists to prevent duplicate seeding
    if db.query(User).first() is not None:
        print("Database already seeded. Skipping.")
        if close_db:
            db.close()
        return

    # Determine counts based on mode
    sku_count = 1000 if limit_for_demo else settings.SEED_SKUS
    tx_count = 10000 if limit_for_demo else settings.SEED_TRANSACTIONS
    warehouse_count = 10 if limit_for_demo else settings.SEED_WAREHOUSES
    supplier_count = 50 if limit_for_demo else settings.SEED_SUPPLIERS

    print(f"Seeding settings: {sku_count} SKUs, {tx_count} Transactions, {warehouse_count} Warehouses, {supplier_count} Suppliers.")
    
    start_time = time.time()
    
    try:
        # 1. Organization
        org = Organization(name="Omni Logistics Inc.")
        db.add(org)
        db.commit()
        db.refresh(org)
        
        # 2. Users with Roles
        users_to_create = [
            {"name": "Admin User", "email": "admin@omnilogistics.com", "role": "Super Admin"},
            {"name": "Operations Manager", "email": "ops@omnilogistics.com", "role": "Operations Manager"},
            {"name": "Warehouse Manager", "email": "warehouse@omnilogistics.com", "role": "Warehouse Manager"},
            {"name": "Auditor User", "email": "auditor@omnilogistics.com", "role": "Auditor"},
            {"name": "Analyst User", "email": "analyst@omnilogistics.com", "role": "Analyst"},
            {"name": "Viewer User", "email": "viewer@omnilogistics.com", "role": "Viewer"},
        ]
        
        hashed_pwd = get_password_hash("omnilogistics2026")
        for u in users_to_create:
            user = User(
                name=u["name"],
                email=u["email"],
                hashed_password=hashed_pwd,
                role=u["role"],
                organization_id=org.id,
                is_active=True
            )
            db.add(user)
        db.commit()
        print("Users seeded successfully.")
        
        # 3. Warehouses
        cities = ["Chicago", "Houston", "Los Angeles", "Atlanta", "Seattle", "New York", "Denver", "Miami", "Boston", "Phoenix"]
        warehouses_data = []
        for i in range(warehouse_count):
            city = cities[i % len(cities)]
            warehouses_data.append({
                "name": f"{city} Distribution Hub {i+1}",
                "location": f"{random.randint(100, 999)} Industrial Pkwy, {city}",
                "capacity": random.choice([50000, 75000, 100000, 150000]),
                "throughput": random.randint(5000, 25000),
                "organization_id": org.id
            })
        db.execute(insert(Warehouse), warehouses_data)
        db.commit()
        
        warehouses = db.query(Warehouse).all()
        warehouse_ids = [w.id for w in warehouses]
        print(f"Seeded {len(warehouse_ids)} Warehouses.")
        
        # 4. Suppliers
        supplier_names = ["Apex Logistics", "Globex SCM", "Pinnacle Tech Supplies", "Titan Industrial", "Matrix Components", "Vanguard Goods", "Horizon Parts"]
        suppliers_data = []
        for i in range(supplier_count):
            name = f"{random.choice(supplier_names)} {i+1}"
            suppliers_data.append({
                "name": name,
                "code": f"SUPP-{10000+i}",
                "contact_email": f"info@{name.lower().replace(' ', '')}.com",
                "delivery_performance": round(random.uniform(0.75, 0.99), 2),
                "quality_score": round(random.uniform(0.80, 1.00), 2),
                "lead_time_days": random.randint(3, 14),
                "risk_score": round(random.uniform(0.02, 0.40), 2)
            })
        db.execute(insert(Supplier), suppliers_data)
        db.commit()
        supplier_ids = [s.id for s in db.query(Supplier).all()]
        print(f"Seeded {len(supplier_ids)} Suppliers.")
        
        # 5. Infrastructure Assets & Sensors
        assets_data = []
        asset_types = ["HVAC Unit", "Cold Storage Bay", "Automated Conveyor", "Lithium Forklift"]
        for wh_id in warehouse_ids:
            for j in range(5):
                t = asset_types[j % len(asset_types)]
                assets_data.append({
                    "name": f"{t} Wh-{wh_id} Line-{j+1}",
                    "type": t,
                    "status": "OPERATIONAL" if random.random() > 0.05 else "MAINTENANCE",
                    "health_score": round(random.uniform(0.70, 1.00), 2),
                    "warehouse_id": wh_id
                })
        db.execute(insert(InfrastructureAsset), assets_data)
        db.commit()
        
        assets = db.query(InfrastructureAsset).all()
        asset_ids = [a.id for a in assets]
        print(f"Seeded {len(asset_ids)} Infrastructure Assets.")
        
        sensors_data = []
        sensor_types = ["Temperature", "Humidity", "Vibration"]
        for a_id in asset_ids:
            for s_type in sensor_types:
                val = random.uniform(15, 25) if s_type == "Temperature" else random.uniform(30, 60)
                if s_type == "Vibration":
                    val = random.uniform(0.1, 1.5)
                sensors_data.append({
                    "asset_id": a_id,
                    "type": s_type,
                    "value": round(val, 2),
                    "status": "OK"
                })
        db.execute(insert(IoTSensor), sensors_data)
        db.commit()
        print(f"Seeded {len(sensors_data)} Sensors.")
        
        # 6. Inventory Items (SKUs)
        print("Generating SKUs (Bulk)...")
        batch_size = 10000
        items_data = []
        
        for i in range(sku_count):
            sku, name, category, cost, retail = get_real_sku_data(i)
            wh_id = random.choice(warehouse_ids)
            
            # Create a realistic quantity
            physical_qty = random.randint(100, 2500)
            
            # Introduce discrepancy in 2% of items
            mismatch = random.random() < 0.02
            if mismatch:
                erp_qty = physical_qty + random.choice([-50, -10, 15, 100])
                wms_qty = physical_qty + random.choice([-20, 0, 20])
            else:
                erp_qty = physical_qty
                wms_qty = physical_qty
                
            items_data.append({
                "sku": sku,
                "name": name,
                "description": f"Industrial grade {name.lower()} in category {category}.",
                "category": category,
                "unit_cost": cost,
                "retail_price": retail,
                "erp_quantity": erp_qty,
                "wms_quantity": wms_qty,
                "physical_quantity": physical_qty,
                "safety_stock": int(physical_qty * 0.1) + 10,
                "reorder_point": int(physical_qty * 0.2) + 20,
                "warehouse_id": wh_id
            })
            
            if len(items_data) >= batch_size:
                db.execute(insert(InventoryItem), items_data)
                db.commit()
                items_data = []
                print(f"  Inserted {i+1} SKUs...")
                
        if items_data:
            db.execute(insert(InventoryItem), items_data)
            db.commit()
            
        items = db.query(InventoryItem.id).all()
        item_ids = [item.id for item in items]
        print(f"Seeded {len(item_ids)} Inventory Items.")
        
        # 7. Inventory Transactions (2 Million)
        print("Generating Transactions (Bulk)...")
        tx_batch_size = 50000
        txs_data = []
        types = ["IN", "OUT", "TRANSFER", "RECONCILE"]
        
        # Create timestamps spreading across last 30 days
        base_time = datetime.now() - timedelta(days=30)
        
        for i in range(tx_count):
            # Pick a random item
            item_id = random.choice(item_ids)
            tx_type = random.choices(types, weights=[45, 45, 8, 2])[0]
            qty = random.randint(5, 150)
            if tx_type == "OUT":
                qty = -qty
                
            # Create timestamp spread
            tx_time = base_time + timedelta(seconds=random.randint(0, 30*24*3600))
            
            txs_data.append({
                "item_id": item_id,
                "type": tx_type,
                "quantity": qty,
                "timestamp": tx_time,
                "reference_id": f"TX-{10000000+i}",
                "details": f"Standard stock flow item movement."
            })
            
            if len(txs_data) >= tx_batch_size:
                db.execute(insert(InventoryTransaction), txs_data)
                db.commit()
                txs_data = []
                if (i+1) % 500000 == 0 or limit_for_demo:
                    print(f"  Inserted {i+1} Transactions...")
                    
        if txs_data:
            db.execute(insert(InventoryTransaction), txs_data)
            db.commit()
            
        print(f"Seeded {tx_count} Inventory Transactions.")
        
        # 8. Purchase Orders & Goods Receipts
        pos_data = []
        grs_data = []
        for i in range(min(500, supplier_count)):
            supp_id = random.choice(supplier_ids)
            amount = round(random.uniform(5000, 85000), 2)
            po_id = i + 1
            pos_data.append({
                "id": po_id,
                "supplier_id": supp_id,
                "status": "COMPLETED",
                "total_amount": amount
            })
            grs_data.append({
                "purchase_order_id": po_id,
                "received_qty": random.randint(100, 1000),
                "status": "ACCEPTED"
            })
        db.execute(insert(PurchaseOrder), pos_data)
        db.execute(insert(GoodsReceipt), grs_data)
        db.commit()
        print("Seeded POs and Goods Receipts.")

        # 9. Forecasts (One per Item)
        print("Generating Forecasts...")
        forecasts_data = []
        fc_batch_size = 20000
        for idx, item_id in enumerate(item_ids):
            forecasts_data.append({
                "item_id": item_id,
                "forecast_date": datetime.now() + timedelta(days=7),
                "predicted_demand": round(random.uniform(100, 2000), 1),
                "confidence_interval": 0.95
            })
            if len(forecasts_data) >= fc_batch_size:
                db.execute(insert(Forecast), forecasts_data)
                db.commit()
                forecasts_data = []
        if forecasts_data:
            db.execute(insert(Forecast), forecasts_data)
            db.commit()
        print("Seeded Forecasts.")

        # 10. Alerts
        alerts_data = []
        for i in range(20):
            wh_id = random.choice(warehouse_ids)
            severity = random.choice(["Warning", "Critical"])
            a_type = random.choice(["Inventory", "Infrastructure", "Supplier"])
            msg = f"Critical threshold breach detected: High humidity in cold room" if a_type == "Infrastructure" else "Supplier shipment delay predicted for PO-12399"
            alerts_data.append({
                "severity": severity,
                "type": a_type,
                "message": msg,
                "status": "ACTIVE",
                "warehouse_id": wh_id
            })
        db.execute(insert(Alert), alerts_data)
        db.commit()
        print("Seeded Alerts.")

        # 11. Initial agent runs and reconciliation results for mismatches
        # Let's query mismatch items
        mismatch_items = db.query(InventoryItem).filter(
            (InventoryItem.erp_quantity != InventoryItem.physical_quantity) | 
            (InventoryItem.wms_quantity != InventoryItem.physical_quantity)
        ).limit(100).all()
        
        run_id = str(uuid.uuid4())
        recon_results_data = []
        for it in mismatch_items:
            variance = it.erp_quantity - it.physical_quantity
            financial_impact = round(variance * it.unit_cost, 2)
            recon_results_data.append({
                "run_id": run_id,
                "item_id": it.id,
                "erp_qty": it.erp_quantity,
                "wms_qty": it.wms_quantity,
                "physical_qty": it.physical_quantity,
                "variance": variance,
                "financial_impact": financial_impact,
                "root_cause": random.choice(["Damaged during receipt", "Misplaced in Bin B-12", "Theft / Shrinkage", "Double scanned at entry"]),
                "status": "PENDING"
            })
        if recon_results_data:
            db.execute(insert(ReconciliationResult), recon_results_data)
            db.commit()
        print(f"Seeded {len(recon_results_data)} active discrepancies in run {run_id}.")
        
        # 12. Audit Logs
        audit_data = [
            {"user_id": 1, "action": "SEED", "target_table": "all", "target_id": None, "details": "Initial system data seed execution completed."}
        ]
        db.execute(insert(AuditLog), audit_data)
        db.commit()

        end_time = time.time()
        print(f"Seeding COMPLETED successfully in {end_time - start_time:.2f} seconds!")
        
    except Exception as e:
        db.rollback()
        print(f"Seeding FAILED due to error: {e}")
        raise e
    finally:
        if "close_db" in locals() and close_db:
            db.close()

if __name__ == "__main__":
    # If run directly, seed in demo mode (fast) or standard mode based on env
    demo_mode = True # Default to demo mode for quick developer setups
    seed_database(limit_for_demo=demo_mode)
