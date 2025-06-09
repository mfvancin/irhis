from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from typing import Dict, Any
import models, schemas
from core.security import get_password_hash, verify_password
from fastapi import HTTPException
from core.gdpr import GDPRCompliance
from sqlalchemy.sql import func
import logging

logger = logging.getLogger(__name__)

gdpr = GDPRCompliance()

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
    """Create a new user."""
    hashed_password = get_password_hash(user.password)
    user_data = user.model_dump(exclude={"password"})
    db_user = models.User(**user_data, hashed_password=hashed_password)

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
    return user

def update_user_password(db: Session, user: models.User, new_password: str):
    """Update a user's password."""
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user

def get_user_consent(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "consent_given": user.consent_given,
        "consent_details": user.consent_details
    }

def update_user_consent(db: Session, user_id: int, consent_data: dict):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    gdpr.log_data_access(
        user_id=user_id,
        action="consent_update",
        data_type="user_consent",
        details=f"Updated consent: {consent_data}"
    )
    
    user.consent_given = consent_data["consent_given"]
    user.consent_details = consent_data["consent_details"]
    user.consent_updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return {"message": "Consent updated successfully"}

def withdraw_user_consent(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    gdpr.log_data_access(
        user_id=user_id,
        action="consent_withdrawal",
        data_type="user_consent",
        details="User withdrew consent"
    )
    
    user.consent_given = False
    user.consent_details = None
    user.consent_updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return {"message": "Consent withdrawn successfully"}

def get_doctor_dashboard(db: Session, user_id: int):
    """Get dashboard data for a doctor."""
    doctor = get_user(db, user_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    active_patients = db.query(models.DoctorPatient)\
        .filter(models.DoctorPatient.doctor_id == user_id)\
        .filter(models.DoctorPatient.status == "active")\
        .count()
    
    pending_consultations = db.query(models.Teleconsultation)\
        .filter(models.Teleconsultation.doctor_id == user_id)\
        .filter(models.Teleconsultation.status == "pending")\
        .count()
    
    today = datetime.utcnow().date()
    today_exercises = db.query(models.Exercise)\
        .join(models.DoctorPatient, models.DoctorPatient.patient_id == models.Exercise.user_id)\
        .filter(models.DoctorPatient.doctor_id == user_id)\
        .filter(func.date(models.Exercise.scheduled_date) == today)\
        .count()
    
    recent_activities = db.query(models.AuditLog)\
        .filter(models.AuditLog.user_id == user_id)\
        .order_by(models.AuditLog.timestamp.desc())\
        .limit(5)\
        .all()
    
    return {
        "activePatients": active_patients,
        "pendingConsultations": pending_consultations,
        "todayExercises": today_exercises,
        "recentActivities": [
            {
                "description": activity.details.get("description", ""),
                "time": activity.timestamp.strftime("%H:%M")
            }
            for activity in recent_activities
        ]
    }

def get_patient_dashboard(db: Session, user_id: int):
    """Get dashboard data for a patient."""
    patient = get_user(db, user_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    completed_exercises = db.query(models.Exercise)\
        .filter(models.Exercise.user_id == user_id)\
        .filter(models.Exercise.completed == True)\
        .count()
    
    next_consultation = db.query(models.Teleconsultation)\
        .filter(models.Teleconsultation.user_id == user_id)\
        .filter(models.Teleconsultation.scheduled_time > datetime.utcnow())\
        .order_by(models.Teleconsultation.scheduled_time)\
        .first()
    
    total_exercises = db.query(models.Exercise)\
        .filter(models.Exercise.user_id == user_id)\
        .count()
    progress_score = int((completed_exercises / total_exercises * 100) if total_exercises > 0 else 0)
    
    today = datetime.utcnow().date()
    today_schedule = db.query(models.Exercise)\
        .filter(models.Exercise.user_id == user_id)\
        .filter(func.date(models.Exercise.scheduled_date) == today)\
        .all()
    
    return {
        "completedExercises": completed_exercises,
        "nextConsultation": next_consultation.scheduled_time.strftime("%Y-%m-%d %H:%M") if next_consultation else "N/A",
        "progressScore": progress_score,
        "todaySchedule": [
            {
                "time": exercise.scheduled_date.strftime("%H:%M"),
                "description": f"{exercise.name} ({exercise.duration_minutes} min)"
            }
            for exercise in today_schedule
        ]
    }

def get_device_sensor_data(db: Session, device_id: str, user_id: int, skip: int = 0, limit: int = 100):
    """Get sensor data for a specific device."""
    return db.query(models.SensorData)\
        .filter(models.SensorData.device_id == device_id)\
        .filter(models.SensorData.user_id == user_id)\
        .order_by(models.SensorData.timestamp.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_processed_sensor_data(db: Session, sensor_data_id: int, user_id: int):
    """Get processed sensor data for a specific entry."""
    sensor_data = db.query(models.SensorData)\
        .filter(models.SensorData.id == sensor_data_id)\
        .filter(models.SensorData.user_id == user_id)\
        .first()
    
    if not sensor_data:
        raise HTTPException(status_code=404, detail="Sensor data not found")
    
    if not sensor_data.processed_data:
        sensor_data.processed_data = process_sensor_data(sensor_data)
        db.commit()
        db.refresh(sensor_data)
    
    return sensor_data

def process_sensor_data(sensor_data: models.SensorData) -> Dict[str, Any]:
    """Process raw sensor data based on its type."""
    if sensor_data.data_type == models.SensorDataType.ACCELEROMETER:
        return process_accelerometer_data(sensor_data.raw_data)
    elif sensor_data.data_type == models.SensorDataType.GYROSCOPE:
        return process_gyroscope_data(sensor_data.raw_data)
    elif sensor_data.data_type == models.SensorDataType.HEART_RATE:
        return process_heart_rate_data(sensor_data.raw_data)
    elif sensor_data.data_type == models.SensorDataType.STEP_COUNT:
        return process_step_count_data(sensor_data.raw_data)
    elif sensor_data.data_type == models.SensorDataType.SLEEP:
        return process_sleep_data(sensor_data.raw_data)
    elif sensor_data.data_type == models.SensorDataType.ACTIVITY:
        return process_activity_data(sensor_data.raw_data)
    else:
        return sensor_data.raw_data

def process_accelerometer_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process accelerometer data to calculate movement metrics."""
    try:
        x, y, z = raw_data['x'], raw_data['y'], raw_data['z']
        
        magnitude = (x**2 + y**2 + z**2)**0.5
        
        intensity = "low"
        if magnitude > 1.5:
            intensity = "high"
        elif magnitude > 1.2:
            intensity = "medium"
        
        return {
            "magnitude": magnitude,
            "intensity": intensity,
            "direction": {
                "x": x,
                "y": y,
                "z": z
            }
        }
    except Exception as e:
        logger.error(f"Error processing accelerometer data: {e}")
        return raw_data

def process_gyroscope_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process gyroscope data to calculate rotation metrics."""
    try:
        x, y, z = raw_data['x'], raw_data['y'], raw_data['z']
        
        rotation_speed = (x**2 + y**2 + z**2)**0.5
        
        max_axis = max(abs(x), abs(y), abs(z))
        rotation_axis = "x" if abs(x) == max_axis else "y" if abs(y) == max_axis else "z"
        
        return {
            "rotation_speed": rotation_speed,
            "rotation_axis": rotation_axis,
            "rotation": {
                "x": x,
                "y": y,
                "z": z
            }
        }
    except Exception as e:
        logger.error(f"Error processing gyroscope data: {e}")
        return raw_data

def process_heart_rate_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process heart rate data to calculate heart rate zones."""
    try:
        value = raw_data['value']
        
        zone = "resting"
        if value > 170:
            zone = "peak"
        elif value > 150:
            zone = "anaerobic"
        elif value > 130:
            zone = "aerobic"
        elif value > 110:
            zone = "fat_burning"
        
        return {
            "value": value,
            "zone": zone,
            "confidence": raw_data.get('confidence', 1.0)
        }
    except Exception as e:
        logger.error(f"Error processing heart rate data: {e}")
        return raw_data

def process_step_count_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process step count data to calculate activity metrics."""
    try:
        count = raw_data['count']
        distance = raw_data.get('distance', 0)
        calories = raw_data.get('calories', 0)
        
        timestamp = datetime.fromisoformat(raw_data['timestamp'])
        now = datetime.utcnow()
        minutes_elapsed = (now - timestamp).total_seconds() / 60
        step_rate = count / minutes_elapsed if minutes_elapsed > 0 else 0
        
        return {
            "count": count,
            "distance": distance,
            "calories": calories,
            "step_rate": step_rate,
            "activity_level": "sedentary" if step_rate < 50 else "active" if step_rate < 100 else "very_active"
        }
    except Exception as e:
        logger.error(f"Error processing step count data: {e}")
        return raw_data

def process_sleep_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process sleep data to calculate sleep quality metrics."""
    try:
        start_time = datetime.fromisoformat(raw_data['start_time'])
        end_time = datetime.fromisoformat(raw_data['end_time'])
        
        duration = (end_time - start_time).total_seconds() / 3600
        
        stages = raw_data.get('stages', {})
        efficiency = 0
        if stages:
            total_time = sum(stages.values())
            deep_sleep = stages.get('deep', 0)
            efficiency = (deep_sleep / total_time) * 100 if total_time > 0 else 0
        
        return {
            "duration": duration,
            "efficiency": efficiency,
            "quality": raw_data.get('quality', 'unknown'),
            "stages": stages
        }
    except Exception as e:
        logger.error(f"Error processing sleep data: {e}")
        return raw_data

def process_activity_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Process activity data to calculate activity metrics."""
    try:
        start_time = datetime.fromisoformat(raw_data['start_time'])
        end_time = datetime.fromisoformat(raw_data['end_time'])
        
        duration = (end_time - start_time).total_seconds() / 60
        
        intensity = raw_data.get('intensity', 'moderate')
        mets = {
            'light': 2.5,
            'moderate': 4.0,
            'vigorous': 8.0
        }.get(intensity, 4.0)
        
        calories = raw_data.get('calories', 0)
        if not calories and 'weight' in raw_data:
            calories = (mets * raw_data['weight'] * duration) / 60
        
        return {
            "type": raw_data['type'],
            "duration": duration,
            "intensity": intensity,
            "mets": mets,
            "calories": calories
        }
    except Exception as e:
        logger.error(f"Error processing activity data: {e}")
        return raw_data

def create_digital_twin(db: Session, digital_twin: schemas.DigitalTwinCreate, user_id: int):
    """Create a new digital twin for a user."""
    db_digital_twin = models.DigitalTwinModel(
        user_id=user_id,
        model_type=digital_twin.model_type,
        parameters=digital_twin.parameters
    )
    db.add(db_digital_twin)
    db.commit()
    db.refresh(db_digital_twin)
    return db_digital_twin

def get_digital_twins(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Get all digital twins for a user."""
    return db.query(models.DigitalTwinModel)\
        .filter(models.DigitalTwinModel.user_id == user_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_digital_twin(db: Session, digital_twin_id: int):
    """Get a specific digital twin by ID."""
    return db.query(models.DigitalTwinModel)\
        .filter(models.DigitalTwinModel.id == digital_twin_id)\
        .first()

def create_simulation(db: Session, simulation: schemas.SimulationCreate, digital_twin_id: int):
    """Create a new simulation for a digital twin."""
    db_simulation = models.Simulation(
        digital_twin_id=digital_twin_id,
        parameters=simulation.parameters,
        status=simulation.status
    )
    db.add(db_simulation)
    db.commit()
    db.refresh(db_simulation)
    return db_simulation

def get_simulations(db: Session, digital_twin_id: int, skip: int = 0, limit: int = 100):
    """Get all simulations for a digital twin."""
    return db.query(models.Simulation)\
        .filter(models.Simulation.digital_twin_id == digital_twin_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_simulation(db: Session, simulation_id: int):
    """Get a specific simulation by ID."""
    return db.query(models.Simulation)\
        .filter(models.Simulation.id == simulation_id)\
        .first()