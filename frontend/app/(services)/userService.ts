import api from './api';

export interface User {
  id: number;
  email: string;
  username: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  medicalConditions?: string[];
  medications?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface HealthMetric {
  id: number;
  userId: number;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  targetMuscleGroups: string[];
  difficultyLevel: number;
  durationMinutes: number;
  instructions: string[];
  videoUrl?: string;
}

export interface AssignedExercise {
  id: number;
  userId: number;
  exerciseId: number;
  exercise: Exercise;
  assignedBy: number;
  assignedDate: string;
  dueDate?: string;
  completed: boolean;
  completedDate?: string;
  feedback?: string;
}

export const userService = {
  getUserProfile: async (userId?: number): Promise<User> => {
    const url = userId ? `/users/${userId}` : '/users/me';
    return api.get<User>(url);
  },

  updateUserProfile: async (data: Partial<User>): Promise<User> => {
    return api.patch<User>('/users/me', data);
  },

  getHealthMetrics: async (params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<HealthMetric[]> => {
    return api.get<HealthMetric[]>('/users/me/health-metrics', params);
  },

  addHealthMetric: async (metric: Omit<HealthMetric, 'id' | 'userId' | 'timestamp'>): Promise<HealthMetric> => {
    return api.post<HealthMetric>('/users/me/health-metrics', metric);
  },

  getAssignedExercises: async (params?: {
    completed?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<AssignedExercise[]> => {
    return api.get<AssignedExercise[]>('/users/me/exercises', params);
  },

  completeExercise: async (exerciseId: number, feedback?: string): Promise<AssignedExercise> => {
    return api.patch<AssignedExercise>(`/users/me/exercises/${exerciseId}/complete`, { feedback });
  },

  assignExerciseToUser: async (userId: number, exerciseId: number): Promise<void> => {
    return api.post<void>(`/users/${userId}/exercises`, { exerciseId });
  },

  removeAssignedExercise: async (userId: number, exerciseId: number): Promise<void> => {
    return api.delete<void>(`/users/${userId}/exercises/${exerciseId}`);
  }
};

export default userService;
