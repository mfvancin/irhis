from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from core.config import settings

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

digital_twin_engine = create_engine(settings.DIGITAL_TWIN_DATABASE_URL)
DigitalTwinSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=digital_twin_engine)
DigitalTwinBase = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_digital_twin_db():
    db = DigitalTwinSessionLocal()
    try:
        yield db
    finally:
        db.close()
