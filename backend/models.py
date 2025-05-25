from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(str, enum.Enum):
    DOCTOR = "doctor"
    PATIENT = "patient"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    phone_number = Column(String, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    consent_given = Column(Boolean, default=False)
    consent_date = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)
    specialization = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    medical_history = Column(JSON, nullable=True)
    current_condition = Column(String, nullable=True)
    surgery_date = Column(DateTime, nullable=True)
    surgery_type = Column(String, nullable=True)
    health_metrics = relationship("HealthMetric", back_populates="user")
    exercises = relationship("Exercise", back_populates="user")
    digital_twins = relationship("DigitalTwinModel", back_populates="user")
    assigned_patients = relationship("DoctorPatient", back_populates="doctor")
    assigned_doctors = relationship("DoctorPatient", back_populates="patient")

class DoctorPatient(Base):
    __tablename__ = "doctor_patients"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("users.id"))
    assigned_date = Column(DateTime, default=func.now())
    status = Column(String)  # active, inactive, pending
    
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="assigned_patients")
    patient = relationship("User", foreign_keys=[patient_id], back_populates="assigned_doctors")


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
