from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    health_metrics = relationship("HealthMetric", back_populates="user")
    exercises = relationship("Exercise", back_populates="user")
    digital_twins = relationship("DigitalTwinModel", back_populates="user")


class HealthMetric(Base):
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    metric_type = Column(String) 
    value = Column(Float)
    timestamp = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="health_metrics")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    description = Column(Text)
    duration_minutes = Column(Integer)
    intensity = Column(String) 
    calories_burned = Column(Float, nullable=True)
    completed = Column(Boolean, default=False)
    scheduled_date = Column(DateTime)
    completed_date = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="exercises")


class DigitalTwinModel(Base):
    __tablename__ = "digital_twins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    model_type = Column(String)
    parameters = Column(JSON)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="digital_twins")
    simulations = relationship("Simulation", back_populates="digital_twin")


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    digital_twin_id = Column(Integer, ForeignKey("digital_twins.id"))
    parameters = Column(JSON)
    results = Column(JSON)
    status = Column(String) 
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    digital_twin = relationship("DigitalTwinModel", back_populates="simulations")
