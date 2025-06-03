from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    DOCTOR = "doctor"
    PATIENT = "patient"

class RehabilitationStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"

class DoctorPatient(Base):
    __tablename__ = "doctor_patients"
    
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("users.id"))
    assigned_date = Column(DateTime, default=func.now())
    status = Column(String)  
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="doctor_patients")
    patient = relationship("User", foreign_keys=[patient_id], back_populates="patient_doctors")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    consent_given = Column(Boolean, default=False)
    consent_details = Column(JSON)
    consent_updated_at = Column(DateTime)
    
    doctor_patients = relationship("DoctorPatient", foreign_keys=[DoctorPatient.doctor_id], back_populates="doctor")
    patient_doctors = relationship("DoctorPatient", foreign_keys=[DoctorPatient.patient_id], back_populates="patient")
    audit_logs = relationship("AuditLog", back_populates="user")
    
    first_name = Column(String)
    last_name = Column(String)
    phone_number = Column(String, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)
    specialization = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    available_hours = Column(JSON, nullable=True)   
    medical_history = Column(JSON, nullable=True)
    current_condition = Column(String, nullable=True)
    surgery_date = Column(DateTime, nullable=True)
    surgery_type = Column(String, nullable=True)
    rehabilitation_status = Column(Enum(RehabilitationStatus), default=RehabilitationStatus.NOT_STARTED)
    movella_dot_id = Column(String, nullable=True)  
    health_metrics = relationship("HealthMetric", back_populates="user")
    exercises = relationship("Exercise", back_populates="user")
    digital_twins = relationship("DigitalTwinModel", back_populates="user")
    sensor_data = relationship("SensorData", back_populates="user")

class SensorDataType(str, enum.Enum):
    ACCELEROMETER = "accelerometer"
    GYROSCOPE = "gyroscope"
    HEART_RATE = "heart_rate"
    STEP_COUNT = "step_count"
    SLEEP = "sleep"
    ACTIVITY = "activity"
    CUSTOM = "custom"

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, default=func.now())
    sensor_id = Column(String)  
    data_type = Column(Enum(SensorDataType))
    device_type = Column(String)  
    device_id = Column(String)    
    raw_data = Column(JSON)      
    processed_data = Column(JSON, nullable=True)  
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=True)
    sensor_metadata = Column('metadata', JSON, nullable=True)
    
    user = relationship("User", back_populates="sensor_data")
    exercise = relationship("Exercise", back_populates="sensor_data")

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
    protocol_id = Column(Integer, ForeignKey("rehabilitation_protocols.id"))
    expected_sensor_data = Column(JSON, nullable=True)  
    user = relationship("User", back_populates="exercises")
    protocol = relationship("RehabilitationProtocol", back_populates="exercises")
    sensor_data = relationship("SensorData", back_populates="exercise")

class RehabilitationProtocol(Base):
    __tablename__ = "rehabilitation_protocols"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    status = Column(String)  
    target_condition = Column(String)  
    duration_weeks = Column(Integer)
    exercises = relationship("Exercise", back_populates="protocol")

class HealthMetric(Base):
    __tablename__ = "health_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    metric_type = Column(String) 
    value = Column(Float)
    timestamp = Column(DateTime, default=func.now())
    user = relationship("User", back_populates="health_metrics")

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

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)  
    data_type = Column(String) 
    details = Column(JSON)
    timestamp = Column(DateTime, default=func.now())
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

    user = relationship("User", back_populates="audit_logs")
