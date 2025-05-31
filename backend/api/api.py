from fastapi import APIRouter
from .routes import users, auth, exercises, digital_twin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(digital_twin.router, prefix="/digital-twin", tags=["digital-twin"])
