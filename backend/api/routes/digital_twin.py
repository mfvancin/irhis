from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from api.deps import get_current_active_user
from models import User
from crud import (
    get_user,
    create_digital_twin as crud_create_digital_twin,
    get_digital_twins,
    get_digital_twin,
    create_simulation,
    get_simulation,
    get_simulations
)
from services.digital_twin import SimulationParameters, SimulationResult, simulation_controller
from core.security import get_current_user
import schemas

router = APIRouter()

@router.post("/{user_id}/simulate", response_model=SimulationResult)
async def run_simulation(
    user_id: int,
    params: SimulationParameters,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Run a digital twin simulation for a user
    """
    user = get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access this user's data")

    health_metrics = user.health_metrics  
    
    result = await simulation_controller.start_simulation(user, health_metrics, params)
    
    return result

@router.get("/simulations/{simulation_id}", response_model=SimulationResult)
async def get_simulation_result(
    simulation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get results of a simulation by ID
    """
    simulation = get_simulation(db, simulation_id=int(simulation_id))
    if not simulation:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    digital_twin = get_digital_twin(db, simulation.digital_twin_id)
    if not digital_twin or (digital_twin.user_id != current_user.id and current_user.role != "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to access this simulation")
    
    result = await simulation_controller.get_simulation_result(simulation_id)
    return result

@router.post("/digital-twins/", response_model=schemas.DigitalTwin)
def create_digital_twin(
    digital_twin: schemas.DigitalTwinCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud_create_digital_twin(db=db, digital_twin=digital_twin, user_id=current_user.id)

@router.get("/digital-twins/", response_model=List[schemas.DigitalTwin])
def read_digital_twins(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_digital_twins(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.get("/digital-twins/{digital_twin_id}", response_model=schemas.DigitalTwin)
def read_digital_twin(
    digital_twin_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    digital_twin = get_digital_twin(db=db, digital_twin_id=digital_twin_id)
    if digital_twin is None:
        raise HTTPException(status_code=404, detail="Digital twin not found")
    if digital_twin.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this digital twin")
    return digital_twin

@router.post("/simulations/", response_model=schemas.Simulation)
def create_simulation(
    simulation: schemas.SimulationCreate,
    digital_twin_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    digital_twin = get_digital_twin(db=db, digital_twin_id=digital_twin_id)
    if digital_twin is None:
        raise HTTPException(status_code=404, detail="Digital twin not found")
    if digital_twin.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create simulations for this digital twin")
    return create_simulation(db=db, simulation=simulation, digital_twin_id=digital_twin_id)

@router.get("/simulations/", response_model=List[schemas.Simulation])
def read_simulations(
    digital_twin_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    digital_twin = get_digital_twin(db=db, digital_twin_id=digital_twin_id)
    if digital_twin is None:
        raise HTTPException(status_code=404, detail="Digital twin not found")
    if digital_twin.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access simulations for this digital twin")
    return get_simulations(db=db, digital_twin_id=digital_twin_id, skip=skip, limit=limit)

@router.get("/simulations/{simulation_id}", response_model=schemas.Simulation)
def read_simulation(
    simulation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    simulation = get_simulation(db=db, simulation_id=simulation_id)
    if simulation is None:
        raise HTTPException(status_code=404, detail="Simulation not found")
    digital_twin = get_digital_twin(db=db, digital_twin_id=simulation.digital_twin_id)
    if digital_twin.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this simulation")
    return simulation
