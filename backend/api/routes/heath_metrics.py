from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from crud import get_health_metric, create_health_metric 
from schemas import HealthMetricOut, HealthMetricCreate 
from database import get_db  

router = APIRouter()

@router.get("/{metric_id}", response_model=HealthMetricOut)
def get_health_metric_route(metric_id: int, db: Session = Depends(get_db)):
    health_metric = get_health_metric(db=db, metric_id=metric_id)
    if health_metric is None:
        raise HTTPException(status_code=404, detail="Health metric not found")
    return health_metric

@router.post("/", response_model=HealthMetricOut)
def create_health_metric_route(health_metric: HealthMetricCreate, db: Session = Depends(get_db)):
    new_health_metric = create_health_metric(db=db, health_metric=health_metric)
    return new_health_metric
