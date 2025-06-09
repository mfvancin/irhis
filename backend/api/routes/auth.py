import logging
from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import schemas, crud, models
from core import security
from core.config import settings
from database import get_db

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.email,
        expires_delta=access_token_expires
    )
    logger.info(f"Generated access token for user: {user.email}")
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/register", response_model=schemas.Token)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserRegisterSimple,
) -> Any:
    logger.info(f"Registration attempt for email: {user_in.email}, username: {user_in.username}")

    existing_user_email = crud.get_user_by_email(db, email=user_in.email)
    if existing_user_email:
        logger.warning(f"Registration failed: Email %s already exists.", user_in.email)
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    existing_user_username = crud.get_user_by_username(db, username=user_in.username)
    if existing_user_username:
        logger.warning(f"Registration failed: Username %s already exists.", user_in.username)
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )

    parts = user_in.full_name.split(" ", 1)
    first_name = parts[0]
    last_name = parts[1] if len(parts) > 1 else ""

    user_create_data = {
        "email": user_in.email,
        "username": user_in.username,
        "password": user_in.password,
        "first_name": first_name,
        "last_name": last_name,
        "role": user_in.role,
    }

    user_create_payload = schemas.UserCreate(**user_create_data)

    try:
        created_user = crud.create_user(db, user=user_create_payload)
        logger.info(f"Successfully created user: {created_user.username} with email {created_user.email}")
    except Exception as e:
        logger.error(f"Error during user creation in DB: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error during user creation: {str(e)}")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=created_user.email,
        expires_delta=access_token_expires
    )
    logger.info(f"Generated access token for newly registered user: {created_user.email}")
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }