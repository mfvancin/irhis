import { format, parseISO } from 'date-fns';
import { HealthMetric, MetricType, MetricUnit } from '../(types)/models';

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch (error) {
    return 'Invalid date';
  }
};

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = parseISO(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export const formatFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`;
};

export const formatHealthMetric = (metric: HealthMetric): string => {
  let formattedValue = `${metric.value} ${metric.unit}`;
  
  if (metric.metricType === MetricType.BLOOD_PRESSURE_SYSTOLIC) {
    return `${metric.value}/${metric.value} ${metric.unit}`;
  }
  
  return formattedValue;
};

export const getMetricReferenceRange = (metricType: string): { min: number; max: number } => {
  switch (metricType) {
    case MetricType.HEART_RATE:
      return { min: 60, max: 100 };
    case MetricType.BLOOD_PRESSURE_SYSTOLIC:
      return { min: 90, max: 120 };
    case MetricType.BLOOD_PRESSURE_DIASTOLIC:
      return { min: 60, max: 80 };
    case MetricType.BLOOD_GLUCOSE:
      return { min: 70, max: 140 };
    case MetricType.TEMPERATURE:
      return { min: 36.5, max: 37.5 };
    case MetricType.RESPIRATORY_RATE:
      return { min: 12, max: 20 };
    case MetricType.OXYGEN_SATURATION:
      return { min: 95, max: 100 };
    default:
      return { min: 0, max: 0 };
  }
};

export const isMetricInNormalRange = (metric: HealthMetric): boolean => {
  const range = getMetricReferenceRange(metric.metricType);
  return metric.value >= range.min && metric.value <= range.max;
};

export const getMetricSeverity = (metric: HealthMetric): 'normal' | 'mild' | 'moderate' | 'severe' => {
  const range = getMetricReferenceRange(metric.metricType);
  
  if (isMetricInNormalRange(metric)) {
    return 'normal';
  }
  
  if (metric.value < range.min) {
    const percentLow = (range.min - metric.value) / range.min;
    if (percentLow > 0.2) return 'severe';
    if (percentLow > 0.1) return 'moderate';
    return 'mild';
  } else {
    const percentHigh = (metric.value - range.max) / range.max;
    if (percentHigh > 0.2) return 'severe';
    if (percentHigh > 0.1) return 'moderate';
    return 'mild';
  }
};