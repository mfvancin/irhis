from pydantic import BaseModel, EmailStr, constr
from typing import Optional, Annotated
from models import UserRole
import models

PasswordStr = Annotated[str, constr(min_length=8)]

# Schema for creating a user
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: PasswordStr
    first_name: str
    last_name: str
    role: UserRole

# Schema for reading/returning user data
class User(BaseModel):
    id: int
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True

# Schema for the registration endpoint
class UserRegisterSimple(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: PasswordStr
    role: models.UserRole

# Schema for token response
class Token(BaseModel):
    access_token: str
    token_type: str

# Schema for token payload data
class TokenData(BaseModel):
    username: Optional[str] = None