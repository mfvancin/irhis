import api from './api';
import { MovellaSensorData, MovellaSimulationOutput } from '../(types)/models';

export interface SimulationParameters {
  duration: number;
  exerciseIntensity: number;
  recoveryTime: number;
}

interface SimulationResult {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  results?: {
    metrics: Record<string, number[]>;
    timestamps: string[];
    metadata?: Record<string, any>;
  };
}

interface SimulationParams {
  scenario: string;
  duration: number;
  parameters: Record<string, any>;
  exerciseIntensity: number;
  recoveryTime: number;
}

interface DigitalTwinService {
  runSimulation: (patientId: number, params: SimulationParams) => Promise<{ data?: SimulationResult; error?: string }>;
  getSimulationResult: (simulationId: string) => Promise<{ data?: SimulationResult; error?: string }>;
  processMovellaData: (sensorData: MovellaSensorData) => Promise<MovellaSimulationOutput>;
}

export const digitalTwinService: DigitalTwinService = {
  runSimulation: async (patientId, params) => {
    console.log("Running simulation for patient", patientId, "with params", params);
    return new Promise(resolve => setTimeout(() => resolve({ 
      data: { 
        id: "sim-123", 
        status: "completed", 
        startedAt: new Date().toISOString(), 
        completedAt: new Date().toISOString(),
        results: { 
          metrics: { heart_rate: [70, 72, 75], blood_glucose: [100, 102, 98] }, 
          timestamps: [new Date().toISOString(), new Date(Date.now() + 5*60000).toISOString(), new Date(Date.now() + 10*60000).toISOString()] 
        }
      }
    }), 2000));
  },

  getSimulationResult: async (simulationId) => {
    console.log("Getting result for simulation", simulationId);
    return new Promise(resolve => setTimeout(() => resolve({ 
      data: { 
        id: simulationId, 
        status: "completed", 
        startedAt: new Date().toISOString(), 
        completedAt: new Date().toISOString(),
        results: { 
          metrics: { heart_rate: [70, 72, 75, 78, 70], blood_glucose: [100, 102, 98, 105, 100] }, 
          timestamps: [
            new Date().toISOString(), 
            new Date(Date.now() + 5*60000).toISOString(), 
            new Date(Date.now() + 10*60000).toISOString(),
            new Date(Date.now() + 15*60000).toISOString(),
            new Date(Date.now() + 20*60000).toISOString()
          ]
        }
      }
    }), 1000));
  },

  processMovellaData: async (sensorData: MovellaSensorData): Promise<MovellaSimulationOutput> => {
    return api.post<MovellaSimulationOutput>('/api/digital-twin/sensor-data', sensorData);
  }
};

export default digitalTwinService;