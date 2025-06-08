declare module 'expo-device' {
  export function isDevice(): boolean;
  export function getDeviceIdAsync(): Promise<string>;
  export function getModelNameAsync(): Promise<string>;
}

declare module 'expo-sensors' {
  export interface AccelerometerData {
    x: number;
    y: number;
    z: number;
  }

  export interface GyroscopeData {
    x: number;
    y: number;
    z: number;
  }

  export const Accelerometer: {
    addListener: (callback: (data: AccelerometerData) => void) => Subscription;
    setUpdateInterval: (intervalMs: number) => void;
  };

  export const Gyroscope: {
    addListener: (callback: (data: GyroscopeData) => void) => Subscription;
    setUpdateInterval: (intervalMs: number) => void;
  };

  export function requestPermissionsAsync(): Promise<{ status: string }>;
}

declare module 'expo-modules-core' {
  export interface Subscription {
    remove: () => void;
  }
} 