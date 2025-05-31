from fastapi import APIRouter, HTTPException
import numpy as np
from scipy.spatial.transform import Rotation
from backend import schemas as main_schemas

router = APIRouter(
    prefix="/digital-twin",
    tags=["Digital Twin"],
)

def process_sensor_data(data: main_schemas.MovellaSensorData) -> main_schemas.MovellaSimulationOutput:
    """
    Process raw sensor data to calculate orientation and motion.
    Uses complementary filter for orientation estimation.
    """
    acc = np.array([data.accelerometer['x'], data.accelerometer['y'], data.accelerometer['z']])
    gyro = np.array([data.gyroscope['x'], data.gyroscope['y'], data.gyroscope['z']])
    
    acc_norm = acc / np.linalg.norm(acc)
    
    pitch = np.arctan2(acc_norm[0], np.sqrt(acc_norm[1]**2 + acc_norm[2]**2))
    roll = np.arctan2(acc_norm[1], acc_norm[2])
    
    q = Rotation.from_euler('xyz', [roll, pitch, 0]).as_quat()
    
    dt = 1.0 / 60.0
    velocity = acc * dt
    position = velocity * dt
        
    return main_schemas.MovellaSimulationOutput(
        device_id=data.device_id,
        timestamp=data.timestamp,
        orientation={'x': q[0], 'y': q[1], 'z': q[2], 'w': q[3]},
        position={'x': position[0], 'y': position[1], 'z': position[2]},
        velocity={'x': velocity[0], 'y': velocity[1], 'z': velocity[2]},
        acceleration={'x': acc[0], 'y': acc[1], 'z': acc[2]}
    )

@router.post("/sensor-data", response_model=main_schemas.MovellaSimulationOutput)
async def process_sensor_data_endpoint(data: main_schemas.MovellaSensorData):
    """
    Process incoming sensor data and return simulation results
    """
    try:
        result = process_sensor_data(data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def root():
    return {
        "message": "Digital Twin API for Movella DOT sensor data processing",
        "version": "1.0.0",
        "endpoints": {
            "/sensor-data": "POST - Process sensor data and return simulation results"
        }
    } 