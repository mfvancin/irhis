from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
import models, crud
from core import security
from core.config import settings
from database import SessionLocal
from schemas import TokenData
import logging

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        logger.info("Decoding JWT token")
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        email: Optional[str] = payload.get("sub")
    except JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise credentials_exception
    
    logger.info(f"Looking up user with email: {email}")
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        logger.error(f"User not found for email: {email}")
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_doctor(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user