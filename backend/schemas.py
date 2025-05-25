from pydantic import BaseModel, EmailStr, constr
from typing import Optional, Annotated
from datetime import datetime

PasswordStr = Annotated[str, constr(min_length=8)]

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: PasswordStr

class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class UserInDB(UserBase):
    hashed_password: str
    is_active: bool = True

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