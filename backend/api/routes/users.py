from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas import UserCreate, UserOut
from crud import create_user, get_user_by_email
from database import get_db
from api.deps import get_current_active_user
from models import User
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """
    Get current user profile
    """
    try:
        logger.info(f"Fetching profile for user: {current_user.email}")
        return current_user
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching user profile")

@router.post("/create", response_model=UserOut)
def create_user_route(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db=db, user=user)

@router.get("/{user_id}", response_model=UserOut)
def get_user_route(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_email(db=db, email=user_id) 
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
