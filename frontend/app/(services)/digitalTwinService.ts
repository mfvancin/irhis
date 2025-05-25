import api from './api';

export interface SimulationParameters {
  duration: number;
  exerciseIntensity: number;
  recoveryTime: number;
}

export interface SimulationResult {
  data: any;
  error: any;
  id: string;
  patientId: number;
  startTime: string;
  endTime: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: any; 
}

export const digitalTwinService = {
  runSimulation: async (patientId: number, params: SimulationParameters): Promise<SimulationResult> => {
    return api.post<SimulationResult>(`/digital-twin/${patientId}/simulate`, params);
  },

  getSimulationResult: async (simulationId: string): Promise<SimulationResult> => {
    return api.get<SimulationResult>(`/digital-twin/simulations/${simulationId}`);
  }
};

export default digitalTwinService;