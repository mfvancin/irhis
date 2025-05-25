from pydantic import BaseModel, EmailStr, constr, validator, Field
from typing import Optional, Annotated, List, Dict, Any
from datetime import datetime
from models import UserRole, RehabilitationStatus

PasswordStr = Annotated[str, constr(min_length=8)]

class SensorDataBase(BaseModel):
    sensor_id: str
    data_type: str
    raw_data: Dict[str, Any]
    processed_data: Optional[Dict[str, Any]] = None
    exercise_id: Optional[int] = None

class SensorDataCreate(SensorDataBase):
    pass

class SensorData(SensorDataBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class ExerciseBase(BaseModel):
    name: str
    description: str
    duration_minutes: int
    intensity: str
    scheduled_date: datetime
    protocol_id: int
    expected_sensor_data: Optional[Dict[str, Any]] = None

class ExerciseCreate(ExerciseBase):
    pass

class Exercise(ExerciseBase):
    id: int
    user_id: int
    calories_burned: Optional[float] = None
    completed: bool
    completed_date: Optional[datetime] = None
    sensor_data: List[SensorData] = []

    class Config:
        from_attributes = True

class RehabilitationProtocolBase(BaseModel):
    name: str
    description: str
    status: str
    target_condition: str
    duration_weeks: int

class RehabilitationProtocolCreate(RehabilitationProtocolBase):
    pass

class RehabilitationProtocol(RehabilitationProtocolBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    exercises: List[Exercise] = []

    class Config:
        from_attributes = True

class TeleconsultationBase(BaseModel):
    doctor_id: int
    scheduled_time: datetime
    duration_minutes: int
    status: str
    notes: Optional[str] = None
    meeting_link: Optional[str] = None

class TeleconsultationCreate(TeleconsultationBase):
    pass

class Teleconsultation(TeleconsultationBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    username: str
    role: UserRole
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    consent_given: bool = False

class UserCreate(UserBase):
    password: PasswordStr
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    medical_history: Optional[Dict[str, Any]] = None
    current_condition: Optional[str] = None
    surgery_date: Optional[datetime] = None
    surgery_type: Optional[str] = None
    rehabilitation_status: RehabilitationStatus = RehabilitationStatus.NOT_STARTED
    movella_dot_id: Optional[str] = None

    @validator('specialization', 'license_number')
    def validate_doctor_fields(cls, v, values):
        if values.get('role') == UserRole.DOCTOR and not v:
            raise ValueError('Specialization and license number are required for doctors')
        return v

    @validator('medical_history', 'current_condition', 'surgery_date', 'surgery_type')
    def validate_patient_fields(cls, v, values):
        if values.get('role') == UserRole.PATIENT and not v:
            raise ValueError('Medical history, current condition, and surgery details are required for patients')
        return v

class User(UserBase):
    id: int
    is_active: bool
    consent_date: Optional[datetime] = None
    last_login: Optional[datetime] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    available_hours: Optional[Dict[str, Any]] = None
    medical_history: Optional[Dict[str, Any]] = None
    current_condition: Optional[str] = None
    surgery_date: Optional[datetime] = None
    surgery_type: Optional[str] = None
    rehabilitation_status: RehabilitationStatus = RehabilitationStatus.NOT_STARTED
    movella_dot_id: Optional[str] = None
    class Config:
        from_attributes = True

class DoctorPatientBase(BaseModel):
    doctor_id: int
    patient_id: int
    status: str

class DoctorPatientCreate(DoctorPatientBase):
    pass

class DoctorPatient(DoctorPatientBase):
    id: int
    assigned_date: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class LoginSchema(BaseModel):
    email: EmailStr
    password: PasswordStr

class HealthMetricBase(BaseModel):
    user_id: int  
    metric_type: str
    value: float
    timestamp: datetime

class HealthMetricCreate(HealthMetricBase):
    pass

class HealthMetricOut(HealthMetricBase):
    id: int

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str