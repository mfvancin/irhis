from sqlalchemy.orm import Session
from models import User, HealthMetric, DoctorPatient, UserRole
from schemas import UserCreate, HealthMetricCreate, DoctorPatientCreate
from core.security import get_password_hash, verify_password
from datetime import datetime

def get_user_by_email(db: Session, email: str):
    """Fetch a user by their email address."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """Fetch a user by their username."""
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    """Create a new user with role-specific validation."""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        role=user.role,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        date_of_birth=user.date_of_birth,
        specialization=user.specialization,
        license_number=user.license_number,
        medical_history=user.medical_history,
        current_condition=user.current_condition,
        surgery_date=user.surgery_date,
        surgery_type=user.surgery_type,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_doctor_patients(db: Session, doctor_id: int):
    """Fetch all patients assigned to a doctor."""
    return db.query(DoctorPatient).filter(DoctorPatient.doctor_id == doctor_id).all()

def get_patient_doctors(db: Session, patient_id: int):
    """Fetch all doctors assigned to a patient."""
    return db.query(DoctorPatient).filter(DoctorPatient.patient_id == patient_id).all()

def assign_patient_to_doctor(db: Session, doctor_id: int, patient_id: int):
    """Assign a patient to a doctor."""
    doctor = db.query(User).filter(User.id == doctor_id, User.role == UserRole.DOCTOR).first()
    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.PATIENT).first()
    
    if not doctor or not patient:
        return None
    
    existing = db.query(DoctorPatient).filter(
        DoctorPatient.doctor_id == doctor_id,
        DoctorPatient.patient_id == patient_id
    ).first()
    
    if existing:
        return existing
    
    assignment = DoctorPatient(
        doctor_id=doctor_id,
        patient_id=patient_id,
        status="pending"
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

def update_assignment_status(db: Session, assignment_id: int, status: str):
    """Update the status of a doctor-patient assignment."""
    assignment = db.query(DoctorPatient).filter(DoctorPatient.id == assignment_id).first()
    if assignment:
        assignment.status = status
        db.commit()
        db.refresh(assignment)
    return assignment

def get_user_health_metrics(db: Session, user_id: int):
    """Fetch all health metrics for a specific user."""
    return db.query(HealthMetric).filter(HealthMetric.user_id == user_id).all()

def get_health_metric(db: Session, metric_id: int):
    """Fetch a specific health metric by its ID."""
    return db.query(HealthMetric).filter(HealthMetric.id == metric_id).first()

def create_health_metric(db: Session, health_metric: HealthMetricCreate):
    """Create a new health metric for a user."""
    db_health_metric = HealthMetric(
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

def update_user_password(db: Session, user: User, new_password: str):
    """Update a user's password."""
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user

def update_user_consent(db: Session, user_id: int, consent: bool):
    """Update a user's consent status."""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.consent_given = consent
        user.consent_date = datetime.utcnow() if consent else None
        db.commit()
        db.refresh(user)
    return user