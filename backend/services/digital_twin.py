from pydantic import BaseModel

class SimulationParameters(BaseModel):
    patient_id: int
    exercise_type: str
    duration: int  
    intensity: float 

class SimulationResult(BaseModel):
    success: bool
    message: str
    predicted_outcome: float 

def simulation_controller(params: SimulationParameters) -> SimulationResult:
    try:
        predicted_outcome = params.intensity * params.duration
        if predicted_outcome > 100:
            return SimulationResult(
                success=True,
                message="Simulation successful. Predicted outcome is excellent.",
                predicted_outcome=predicted_outcome
            )
        else:
            return SimulationResult(
                success=True,
                message="Simulation completed with moderate results.",
                predicted_outcome=predicted_outcome
            )
    except Exception as e:
        return SimulationResult(
            success=False,
            message=f"Simulation failed: {str(e)}",
            predicted_outcome=0.0
        )
