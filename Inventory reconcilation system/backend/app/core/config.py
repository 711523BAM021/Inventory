import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Powered Multi-Agent Inventory Reconciliation & Infrastructure Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "enterprise_super_secret_key_9876543210_change_in_prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "inventory_platform"
    DATABASE_URL: Optional[str] = None
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: str = "6379"
    
    # AI Keys
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    
    # Seeding (Optimized Counts for Fast Demo Seeding)
    # Default is the requested counts, but allow overrides
    SEED_SKUS: int = 100000
    SEED_WAREHOUSES: int = 50
    SEED_SUPPLIERS: int = 500
    SEED_TRANSACTIONS: int = 2000000
    
    # Database Mode
    USE_SQLITE: bool = True  # Fallback to SQLite by default for instant local execution
    SQLITE_URL: str = "sqlite:///./inventory_reconciliation.db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @property
    def sync_database_url(self) -> str:
        if self.USE_SQLITE:
            return self.SQLITE_URL
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
