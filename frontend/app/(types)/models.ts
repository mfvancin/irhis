export interface User {
    id: number;
    email: string;
    username: string;
    isActive: boolean;
    isDoctor: boolean;
  }
  
  export interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    healthStatus: string;
    medicalHistory: string[];
    currentMedications: Medication[];
    vitalSigns: VitalSigns;
  }

  export interface Medication {
    id: number;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
  }

  export interface VitalSigns {
    heartRate: number;
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    bloodGlucose: number;
    oxygenSaturation: number;
    temperature: number;
    lastUpdated: string;
  }

  export interface DigitalTwinModel {
    id: string;
    patientId: number;
    lastUpdated: string;
    modelParameters: Record<string, any>;
    accuracyScore: number;
  }

  export interface DigitalTwinSimulation {
    id: string;
    patientId: number;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    startedAt: string;
    completedAt?: string;
    scenario: string;
    duration: number;
    parameters: Record<string, any>;
    resultsId?: string;
    error?: string;
  }
  
  export interface SimulationParams {
    scenario: string;
    duration: number;
    parameters: Record<string, any>;
  }
  
  export interface SimulationResults {
    id: string;
    simulationId: string;
    patientId: number;
    metrics: {
      heart_rate?: number[];
      blood_glucose?: number[];
      blood_pressure_systolic?: number[];
      blood_pressure_diastolic?: number[];
      oxygen_saturation?: number[];
      [key: string]: number[] | undefined;
    };
    timestamps: string[];
    analysis?: {
      summary: string;
      findings: Array<{
        metric: string;
        observation: string;
        severity: 'low' | 'medium' | 'high';
      }>;
      recommendations: string[];
    };
    metadata: {
      scenario: string;
      duration: number;
      [key: string]: any;
    };
  }
  
  export interface DigitalTwinModel {
    id: string;
    patientId: number;
    version: string;
    createdAt: string;
    updatedAt: string;
    accuracy: number;
    parameters: Record<string, any>;
    status: 'training' | 'active' | 'archived';
  }
  
  export interface PatientFormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string; 
    gender: string;
    medicalHistory?: string;
    contactNumber?: string;
    address?: string;
    userId?: number;
  }
  
  export interface Doctor {
    id: number;
    firstName: string;
    lastName: string;
    specialty: string;
    email: string;
    phone: string;
    patients: PatientSummary[];
    schedule: ScheduleSlot[];
    digitalTwinAccess: number[]; 
  }

  export interface PatientSummary {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    healthStatus: string;
    assignedDate: string;
  }
  
  export interface ScheduleSlot {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    patientId?: number;
    patientName?: string;
    appointmentType?: string;
    status: 'available' | 'booked' | 'cancelled' | 'completed';
  }
  
  export interface DoctorFormData {
    firstName: string;
    lastName: string;
    specialty: string;
    email: string;
    phone: string;
    licenseNumber?: string;
    hospital?: string;
    department?: string;
    biography?: string;
    education?: string[];
    certifications?: string[];
  }  

  export interface DoctorPatientAssignment {
    success: boolean;
    doctorId: number;
    patientId: number;
  }
  
  export interface DoctorAvailability {
    date: string;
    slots: string[];
  }
  
  export interface HealthMetric {
    id: number;
    patientId: number;
    metricType: string;
    value: number;
    unit: string;
    measuredAt: string; 
    notes?: string;
  }
  
  export interface HealthMetricFormData {
    metricType: string;
    value: number;
    unit: string;
    measuredAt?: string; 
    notes?: string;
  }
  
  export enum MetricType {
    HEART_RATE = "heart_rate",
    BLOOD_PRESSURE_SYSTOLIC = "blood_pressure_systolic",
    BLOOD_PRESSURE_DIASTOLIC = "blood_pressure_diastolic",
    BLOOD_GLUCOSE = "blood_glucose",
    WEIGHT = "weight",
    TEMPERATURE = "temperature",
    RESPIRATORY_RATE = "respiratory_rate",
    OXYGEN_SATURATION = "oxygen_saturation",
  }
  
  export enum MetricUnit {
    BPM = "bpm", 
    MMHG = "mmHg", 
    MG_DL = "mg/dL", 
    KG = "kg",
    CELSIUS = "°C",
    BREATHS_MIN = "breaths/min",
    PERCENT = "%",
  }
  
  export interface Exercise {
    id: number;
    patientId: number;
    name: string;
    description?: string;
    durationMinutes: number;
    intensity: ExerciseIntensity;
    caloriesBurned?: number;
    scheduled: string;
    completed: boolean;
    completedDate?: string;
  }
  
  export interface ExerciseFormData {
    name: string;
    description?: string;
    durationMinutes: number;
    intensity: ExerciseIntensity;
    caloriesBurned?: number;
    scheduled: string;
    completed?: boolean;
    completedDate?: string; 
  }
  
  export enum ExerciseIntensity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
  }
  
  export interface DigitalTwin {
    id: number;
    patientId: number;
    modelType: string;
    parameters: Record<string, any>;
    createdAt: string; 
    updatedAt: string; 
  }
  
  export interface SimulationParams {
    durationDays: number;
    timeStepHours: number;
    scenario: string;
    parameters: Record<string, any>
  }
  
  export enum SimulationScenario {
    BASELINE = "baseline",
    EXERCISE_IMPACT = "exercise_impact",
    MEDICATION_RESPONSE = "medication_response",
  }
  
  export interface SimulationResult {
    id: string;
    status: string;
    createdAt: string; 
    completedAt?: string; 
    results?: SimulationResultData;
  }
  
  export interface SimulationResultData {
    metadata: {
      patientId: number;
      scenario: string;
      durationDays: number;
      timeStepHours: number;
      [key: string]: any;
    };
    timestamps: string[]; 
    metrics: Record<string, number[]>;
  }
  
  export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  export interface AuthResponse {
    accessToken: string;
    tokenType: string;
  }
  
  export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
  }