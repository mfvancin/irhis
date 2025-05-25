from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import schemas, crud, models
from services.email import send_reset_email
from api import deps
from core import security
from core.config import settings
from database import get_db
import logging
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

router = APIRouter()

logger = logging.getLogger(__name__)

ALLOWED_GOOGLE_CLIENT_IDS = [
    settings.GOOGLE_CLIENT_ID_IOS,
    settings.GOOGLE_CLIENT_ID_ANDROID,
]

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

@router.post("/register", response_model=schemas.UserOut)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user.
    """
    try:
        user = crud.get_user_by_email(db, email=user_in.email)
        if user:
            logger.error(f"User with email {user_in.email} already exists.")
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system",
            )
        user = crud.get_user_by_username(db, username=user_in.username)
        if user:
            logger.error(f"User with username {user_in.username} already exists.")
            raise HTTPException(
                status_code=400,
                detail="The user with this username already exists in the system",
            )
        user = crud.create_user(db, user=user_in)
        logger.info(f"Successfully created user: {user_in.username}")
        return user
    except Exception as e:
        logger.error(f"Error during user registration: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/google-login", response_model=schemas.Token)
def google_login(
    *,
    db: Session = Depends(get_db),
    token_data: dict
) -> Any:
    """
    Authenticate user with Google ID token
    """
    id_token = token_data.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="ID token is required")
    
    try:
        # Try both client IDs
        id_info = None
        for client_id in ALLOWED_GOOGLE_CLIENT_IDS:
            try:
                id_info = google_id_token.verify_oauth2_token(
                    id_token, google_requests.Request(), client_id
                )
                break
            except ValueError:
                continue

        if not id_info:
            raise HTTPException(status_code=400, detail="Invalid Google token")

        email = id_info.get("email")
        username = id_info.get("name") or email.split('@')[0]  

        if not email:
            raise HTTPException(status_code=400, detail="Invalid Google token: missing email")

        user = crud.get_user_by_email(db, email=email)
        if not user:
            user_in = schemas.UserCreate(
                email=email,
                username=username,
                password=settings.SECRET_KEY  
            )
            user = crud.create_user(db, user=user_in)

        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = security.create_access_token(
            user.email, expires_delta=access_token_expires
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    except ValueError as e:
        logger.error(f"Google token verification error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.post("/forgot-password")
def forgot_password(
    *,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    request: schemas.ForgotPasswordRequest
) -> Any:
    user = crud.get_user_by_email(db, email=request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_token = security.create_access_token(
        subject=user.email,
        expires_delta=timedelta(minutes=30)
    )    
    reset_url = f"https://your-app.com/reset-password?token={reset_token}"

    background_tasks.add_task(send_reset_email, email=user.email, reset_link=reset_url)
    return {"message": "Reset email sent"}

@router.post("/reset-password")
def reset_password(
    *,
    db: Session = Depends(get_db),
    request: schemas.ResetPasswordRequest
) -> Any:
    try:
        payload = security.decode_access_token(request.token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token")

        user = crud.get_user_by_email(db, email=email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        crud.update_user_password(db, user=user, new_password=request.new_password)
        return {"message": "Password reset successful"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired token")