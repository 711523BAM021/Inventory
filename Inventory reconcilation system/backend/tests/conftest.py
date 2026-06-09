import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from backend.app.db.session import Base, get_db
from backend.app.main import app

# Use isolated sqlite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_db.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

import os

@pytest.fixture(scope="module", autouse=True)
def init_test_db():
    # Remove existing test db file to prevent integrity issues
    db_file = "./test_db.db"
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass
            
    Base.metadata.create_all(bind=engine)
    
    # Import seeder and populate mock data
    from backend.app.services.seeder import seed_database
    try:
        test_session = TestingSessionLocal()
        seed_database(db_session=test_session, bind_engine=engine, limit_for_demo=True)
    except Exception as e:
        print(f"Seeder setup log: {e}")
        
    yield
    
    # Clean up after tests are complete
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
