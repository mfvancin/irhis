import { PatientFormData, HealthMetricFormData, ExerciseFormData } from '../(types)/models';

export const validatePatientForm = (data: PatientFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required';
  }
  
  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }
  
  if (!data.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required';
  } else {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    if (birthDate >= today) {
      errors.dateOfBirth = 'Date of birth must be in the past';
    }
  }
  
  if (!data.gender) {
    errors.gender = 'Gender is required';
  }
  
  if (data.contactNumber && !/^\+?[\d\s()-]{10,15}$/.test(data.contactNumber)) {
    errors.contactNumber = 'Invalid phone number format';
  }
  
  return errors;
};

export const validateHealthMetricForm = (data: HealthMetricFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.metricType) {
    errors.metricType = 'Metric type is required';
  }
  
  if (data.value === undefined || data.value === null) {
    errors.value = 'Value is required';
  }
  
  if (!data.unit) {
    errors.unit = 'Unit is required';
  }
  
  return errors;
};

export const validateExerciseForm = (data: ExerciseFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.name.trim()) {
    errors.name = 'Exercise name is required';
  }
  
  if (!data.durationMinutes || data.durationMinutes <= 0) {
    errors.durationMinutes = 'Duration must be greater than 0';
  }
  
  if (!data.intensity) {
    errors.intensity = 'Intensity is required';
  }
  
  if (!data.scheduled) {
    errors.scheduled = 'Schedule date is required';
  }
  
  return errors;
};