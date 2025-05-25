from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_exercises():
    return {"message": "List of exercises"}
