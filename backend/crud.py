from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime
from typing import List, Optional, Dict, Any
import models, schemas
from core.security import get_password_hash, verify_password
from fastapi import HTTPException

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Fetch a user by their email address."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """Fetch a user by their username."""
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    """Create a new user with role-specific validation."""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        date_of_birth=user.date_of_birth,
        consent_given=user.consent_given,
        consent_date=datetime.now() if user.consent_given else None,
        specialization=user.specialization if user.role == models.UserRole.DOCTOR else None,
        license_number=user.license_number if user.role == models.UserRole.DOCTOR else None,
        medical_history=user.medical_history if user.role == models.UserRole.PATIENT else None,
        current_condition=user.current_condition if user.role == models.UserRole.PATIENT else None,
        surgery_date=user.surgery_date if user.role == models.UserRole.PATIENT else None,
        surgery_type=user.surgery_type if user.role == models.UserRole.PATIENT else None
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: Dict[str, Any]):
    db_user = get_user(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user_update.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def create_sensor_data(db: Session, sensor_data: schemas.SensorDataCreate, user_id: int):
    db_sensor_data = models.SensorData(
        user_id=user_id,
        **sensor_data.dict()
    )
    db.add(db_sensor_data)
    db.commit()
    db.refresh(db_sensor_data)
    return db_sensor_data

def get_sensor_data(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.SensorData)\
        .filter(models.SensorData.user_id == user_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def create_exercise(db: Session, exercise: schemas.ExerciseCreate, user_id: int):
    db_exercise = models.Exercise(
        user_id=user_id,
        **exercise.dict()
    )
    db.add(db_exercise)
    db.commit()
    db.refresh(db_exercise)
    return db_exercise

def get_exercises(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Exercise)\
        .filter(models.Exercise.user_id == user_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def update_exercise(db: Session, exercise_id: int, exercise_update: Dict[str, Any]):
    db_exercise = db.query(models.Exercise).filter(models.Exercise.id == exercise_id).first()
    if not db_exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    for key, value in exercise_update.items():
        if hasattr(db_exercise, key):
            setattr(db_exercise, key, value)
    
    db.commit()
    db.refresh(db_exercise)
    return db_exercise

def create_rehabilitation_protocol(db: Session, protocol: schemas.RehabilitationProtocolCreate, created_by: int):
    db_protocol = models.RehabilitationProtocol(
        created_by=created_by,
        **protocol.dict()
    )
    db.add(db_protocol)
    db.commit()
    db.refresh(db_protocol)
    return db_protocol

def get_rehabilitation_protocols(db: Session, created_by: int, skip: int = 0, limit: int = 100):
    return db.query(models.RehabilitationProtocol)\
        .filter(models.RehabilitationProtocol.created_by == created_by)\
        .offset(skip)\
        .limit(limit)\
        .all()

def create_teleconsultation(db: Session, teleconsultation: schemas.TeleconsultationCreate, user_id: int):
    db_teleconsultation = models.Teleconsultation(
        user_id=user_id,
        **teleconsultation.dict()
    )
    db.add(db_teleconsultation)
    db.commit()
    db.refresh(db_teleconsultation)
    return db_teleconsultation

def get_teleconsultations(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Teleconsultation)\
        .filter(
            or_(
                models.Teleconsultation.user_id == user_id,
                models.Teleconsultation.doctor_id == user_id
            )
        )\
        .offset(skip)\
        .limit(limit)\
        .all()

def create_doctor_patient(db: Session, doctor_patient: schemas.DoctorPatientCreate):
    db_doctor_patient = models.DoctorPatient(**doctor_patient.dict())
    db.add(db_doctor_patient)
    db.commit()
    db.refresh(db_doctor_patient)
    return db_doctor_patient

def get_doctor_patients(db: Session, doctor_id: int):
    """Fetch all patients assigned to a doctor."""
    return db.query(models.DoctorPatient).filter(models.DoctorPatient.doctor_id == doctor_id).all()

def get_patient_doctors(db: Session, patient_id: int):
    """Fetch all doctors assigned to a patient."""
    return db.query(models.DoctorPatient).filter(models.DoctorPatient.patient_id == patient_id).all()

def update_doctor_patient_status(db: Session, doctor_patient_id: int, status: str):
    db_doctor_patient = db.query(models.DoctorPatient)\
        .filter(models.DoctorPatient.id == doctor_patient_id)\
        .first()
    if not db_doctor_patient:
        raise HTTPException(status_code=404, detail="Doctor-patient relationship not found")
    
    db_doctor_patient.status = status
    db.commit()
    db.refresh(db_doctor_patient)
    return db_doctor_patient

def get_user_health_metrics(db: Session, user_id: int):
    """Fetch all health metrics for a specific user."""
    return db.query(models.HealthMetric).filter(models.HealthMetric.user_id == user_id).all()

def get_health_metric(db: Session, metric_id: int):
    """Fetch a specific health metric by its ID."""
    return db.query(models.HealthMetric).filter(models.HealthMetric.id == metric_id).first()

def create_health_metric(db: Session, health_metric: schemas.HealthMetricCreate):
    """Create a new health metric for a user."""
    db_health_metric = models.HealthMetric(
        user_id=health_metric.user_id,
        metric_type=health_metric.metric_type,
        value=health_metric.value,
        timestamp=health_metric.timestamp,
    )
    db.add(db_health_metric)
    db.commit()
    db.refresh(db_health_metric)
    return db_health_metric

def authenticate_user(db: Session, identifier: str, password: str):
    """Authenticate a user by email or username and password."""
    user = get_user_by_email(db, identifier)
    if not user:
        user = get_user_by_username(db, identifier)
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    user.last_login = datetime.utcnow()
    db.commit()
    return user

def update_user_password(db: Session, user: models.User, new_password: str):
    """Update a user's password."""
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user

def update_user_consent(db: Session, user_id: int, consent: bool):
    """Update a user's consent status."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.consent_given = consent
        user.consent_date = datetime.utcnow() if consent else None
        db.commit()
        db.refresh(user)
    return user