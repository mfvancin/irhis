from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
import uvicorn
from core.config import settings
from database import Base, engine, SessionLocal
import logging
from datetime import datetime
import crud, models, schemas
from core.security import create_access_token, get_current_user
from api.routes import auth, users, exercises

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="IRHIS API",
    description="Remote rehabilitation system for musculoskeletal surgery patients",
    version="1.0.0"
)

@app.get("/", include_in_schema=False)
def read_root():
    return {"message": "IRHIS API is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    response = await call_next(request)
    duration = datetime.utcnow() - start_time
    
    logger.info(
        f"Method: {request.method} Path: {request.url.path} "
        f"Status: {response.status_code} Duration: {duration.total_seconds():.2f}s"
    )
    
    return response

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=schemas.User)
def update_user_me(
    user_update: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.update_user(db=db, user_id=current_user.id, user_update=user_update)

@app.post("/sensor-data/", response_model=schemas.SensorData)
async def create_sensor_data(
    sensor_data: schemas.SensorDataCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Store in database
    db_sensor_data = crud.create_sensor_data(db=db, sensor_data=sensor_data, user_id=current_user.id)
    
    return db_sensor_data

@app.get("/sensor-data/", response_model=List[schemas.SensorData])
def read_sensor_data(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_sensor_data(db=db, user_id=current_user.id, skip=skip, limit=limit)

@app.post("/sensor-data/batch", response_model=List[schemas.SensorData])
def create_sensor_data_batch(
    sensor_data_list: List[schemas.SensorDataCreate],
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create multiple sensor data entries at once."""
    return [crud.create_sensor_data(db=db, sensor_data=data, user_id=current_user.id) 
            for data in sensor_data_list]

@app.get("/sensor-data/types", response_model=List[str])
def get_sensor_data_types():
    """Get all available sensor data types."""
    return [data_type.value for data_type in models.SensorDataType]

@app.get("/sensor-data/device/{device_id}", response_model=List[schemas.SensorData])
def get_device_sensor_data(
    device_id: str,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get sensor data for a specific device."""
    return crud.get_device_sensor_data(db=db, device_id=device_id, user_id=current_user.id, skip=skip, limit=limit)

@app.get("/sensor-data/processed/{sensor_data_id}", response_model=schemas.SensorData)
def get_processed_sensor_data(
    sensor_data_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get processed sensor data for a specific entry."""
    return crud.get_processed_sensor_data(db=db, sensor_data_id=sensor_data_id, user_id=current_user.id)

@app.post("/exercises/", response_model=schemas.Exercise)
def create_exercise(
    exercise: schemas.ExerciseCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.create_exercise(db=db, exercise=exercise, user_id=current_user.id)

@app.get("/exercises/", response_model=List[schemas.Exercise])
def read_exercises(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_exercises(db=db, user_id=current_user.id, skip=skip, limit=limit)

@app.put("/exercises/{exercise_id}", response_model=schemas.Exercise)
def update_exercise(
    exercise_id: int,
    exercise_update: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.update_exercise(db=db, exercise_id=exercise_id, exercise_update=exercise_update)

@app.post("/rehabilitation-protocols/", response_model=schemas.RehabilitationProtocol)
def create_rehabilitation_protocol(
    protocol: schemas.RehabilitationProtocolCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Only doctors can create rehabilitation protocols")
    return crud.create_rehabilitation_protocol(db=db, protocol=protocol, created_by=current_user.id)

@app.get("/rehabilitation-protocols/", response_model=List[schemas.RehabilitationProtocol])
def read_rehabilitation_protocols(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == models.UserRole.DOCTOR:
        return crud.get_rehabilitation_protocols(db=db, created_by=current_user.id, skip=skip, limit=limit)
    else:
        return crud.get_patient_protocols(db=db, patient_id=current_user.id, skip=skip, limit=limit)

@app.post("/doctor-patients/", response_model=schemas.DoctorPatient)
def create_doctor_patient(
    doctor_patient: schemas.DoctorPatientCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(status_code=403, detail="Only doctors can create doctor-patient relationships")
    return crud.create_doctor_patient(db=db, doctor_patient=doctor_patient)

@app.get("/doctor-patients/", response_model=List[schemas.DoctorPatient])
def read_doctor_patients(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == models.UserRole.DOCTOR:
        return crud.get_doctor_patients(db=db, doctor_id=current_user.id)
    else:
        return crud.get_patient_doctors(db=db, patient_id=current_user.id)

@app.put("/doctor-patients/{doctor_patient_id}", response_model=schemas.DoctorPatient)
def update_doctor_patient_status(
    doctor_patient_id: int,
    status: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.update_doctor_patient_status(db=db, doctor_patient_id=doctor_patient_id, status=status)

@app.get("/users/{user_id}/consent", response_model=dict)
def get_user_consent(user_id: int, db: Session = Depends(get_db)):
    """Get user's consent status and details."""
    return crud.get_user_consent(db, user_id)

@app.put("/users/{user_id}/consent", response_model=dict)
def update_user_consent(
    user_id: int,
    consent_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update user's consent status and details."""
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this user's consent"
        )
    return crud.update_user_consent(db, user_id, consent_data)

@app.delete("/users/{user_id}/consent", response_model=dict)
def withdraw_user_consent(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Withdraw user's consent."""
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to withdraw this user's consent"
        )
    return crud.withdraw_user_consent(db, user_id)

@app.get("/users/{user_id}/dashboard")
def get_user_dashboard(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get role-specific dashboard data for a user."""
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this dashboard"
        )
    
    if current_user.role == models.UserRole.DOCTOR:
        return crud.get_doctor_dashboard(db, user_id)
    else:
        return crud.get_patient_dashboard(db, user_id)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(exercises.router, prefix="/api/exercises", tags=["exercises"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG_MODE
    )