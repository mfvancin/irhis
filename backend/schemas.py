from pydantic import BaseModel, EmailStr, constr, validator
from typing import Optional, Annotated, List, Dict, Any
from datetime import datetime
from models import UserRole

PasswordStr = Annotated[str, constr(min_length=8)]

class UserBase(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None

class UserCreate(UserBase):
    password: PasswordStr
    role: UserRole
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    medical_history: Optional[Dict[str, Any]] = None
    current_condition: Optional[str] = None
    surgery_date: Optional[datetime] = None
    surgery_type: Optional[str] = None

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

class UserOut(UserBase):
    id: int
    is_active: bool
    role: UserRole
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    medical_history: Optional[Dict[str, Any]] = None
    current_condition: Optional[str] = None
    surgery_date: Optional[datetime] = None
    surgery_type: Optional[str] = None
    consent_given: bool
    consent_date: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserInDB(UserBase):
    hashed_password: str
    is_active: bool = True
    role: UserRole
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    medical_history: Optional[Dict[str, Any]] = None
    current_condition: Optional[str] = None
    surgery_date: Optional[datetime] = None
    surgery_type: Optional[str] = None
    consent_given: bool = False
    consent_date: Optional[datetime] = None
    last_login: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

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

class DoctorPatientCreate(BaseModel):
    patient_id: int
    status: str = "pending"

class DoctorPatientOut(BaseModel):
    id: int
    doctor_id: int
    patient_id: int
    assigned_date: datetime
    status: str

    class Config:
        from_attributes = True