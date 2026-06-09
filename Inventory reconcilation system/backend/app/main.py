import time
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1.endpoints import auth, inventory
from backend.app.mcp import routes as mcp_routes
from backend.app.db.session import engine, Base
from backend.app.services.seeder import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Establish schema creation and seed operations with retries (essential for slow docker db startups)
    retries = 10
    while retries > 0:
        try:
            print("Checking database readiness...")
            Base.metadata.create_all(bind=engine)
            seed_database(limit_for_demo=True)
            print("Database setup complete.")
            break
        except Exception as e:
            print(f"Database connection offline: {e}. Retrying in 3s... ({retries} retries left)")
            retries -= 1
            time.sleep(3)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(mcp_routes.router, prefix=settings.API_V1_STR)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "database_mode": "SQLite" if settings.USE_SQLITE else "PostgreSQL"
    }
