from sqlalchemy.orm import Session
from models import User, HealthMetric
from schemas import UserCreate, HealthMetricCreate
from core.security import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str):
    """Fetch a user by their email address."""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    """Fetch a user by their username."""
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate):
    """Create a new user (no roles distinction)."""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_health_metrics(db: Session, user_id: int):
    """Fetch all health metrics for a specific user."""
    return db.query(HealthMetric).filter(HealthMetric.user_id == user_id).all()

def get_health_metric(db: Session, metric_id: int):
    """Fetch a specific health metric by its ID."""
    return db.query(HealthMetric).filter(HealthMetric.id == metric_id).first()

def create_health_metric(db: Session, health_metric: HealthMetricCreate):
    """Create a new health metric for a user."""
    db_health_metric = HealthMetric(
        user_id=health_metric.user_id,
        metric_type=health_metric.metric_type,
        value=health_metric.value,
        timestamp=health_metric.timestamp,
    )
    db.add(db_health_metric)
    db.commit()
    db.refresh(db_health_metric)
    return db_health_metric

def authenticate_user(db: Session, identifier: str, password: str):
    """
    Authenticate a user by email or username and password.
    """
    user = get_user_by_email(db, identifier)
    if not user:
        user = get_user_by_username(db, identifier)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def update_user_password(db: Session, user: User, new_password: str):
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(user)
    return user