from sqlalchemy.orm import Session
import models, schemas
from core.hashing import get_password_hash, verify_password

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    """Fetch a user by their email address."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """Fetch a user by their username."""
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    """Create a new user."""
    hashed_password = get_password_hash(user.password)
    user_data = user.model_dump(exclude={"password"})
    db_user = models.User(**user_data, hashed_password=hashed_password)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, identifier: str, password: str):
    """Authenticate a user by email or username and password."""
    user = get_user_by_email(db, identifier)
    if not user:
        user = get_user_by_username(db, identifier)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user