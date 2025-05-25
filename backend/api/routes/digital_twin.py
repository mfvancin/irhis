from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from api.deps import get_current_active_user
from models import User  
from crud import get_user_by_email  
from services.digital_twin import SimulationParameters, SimulationResult, simulation_controller

router = APIRouter()

@router.post("/{user_id}/simulate", response_model=SimulationResult)
async def run_simulation(
    user_id: int,
    params: SimulationParameters,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Run a digital twin simulation for a user (previously patient)
    """
    user = get_user_by_email(db, email=user_id)  
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    health_metrics = user.health_metrics  
    
    result = await simulation_controller.start_simulation(user, health_metrics, params)
    
    return result

@router.get("/simulations/{simulation_id}", response_model=SimulationResult)
async def get_simulation(
    simulation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get results of a simulation by ID
    """
    result = await simulation_controller.get_simulation_result(simulation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    return result
