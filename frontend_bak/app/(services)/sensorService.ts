import api from './api';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Sensors from 'expo-sensors';
import { Subscription } from 'expo-modules-core';

export interface SensorData {
  sensor_id: string;
  data_type: string;
  device_type: string;
  device_id: string;
  raw_data: any;
  processed_data?: any;
  exercise_id?: number;
  metadata?: any;
}

class SensorService {
  private accelerometerSubscription: Subscription | null = null;
  private gyroscopeSubscription: Subscription | null = null;
  private isCollecting: boolean = false;

  async initializeSensors() {
    if (!Device.isDevice()) {
      console.warn('Sensors are not available on simulator');
      return false;
    }

    try {
      const { status } = await Sensors.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access sensors was denied');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error initializing sensors:', error);
      return false;
    }
  }

  async startCollectingSensorData(userId: number, exerciseId?: number) {
    if (this.isCollecting) return;
    this.isCollecting = true;

    try {
      this.accelerometerSubscription = Sensors.Accelerometer.addListener(
        async (data: Sensors.AccelerometerData) => {
          const sensorData: SensorData = {
            sensor_id: 'accelerometer',
            data_type: 'accelerometer',
            device_type: Platform.OS,
            device_id: await Device.getDeviceIdAsync(),
            raw_data: data,
            exercise_id: exerciseId,
            metadata: {
              platform: Platform.OS,
              model: await Device.getModelNameAsync(),
            },
          };

          await this.sendSensorData(sensorData);
        }
      );

      this.gyroscopeSubscription = Sensors.Gyroscope.addListener(
        async (data: Sensors.GyroscopeData) => {
          const sensorData: SensorData = {
            sensor_id: 'gyroscope',
            data_type: 'gyroscope',
            device_type: Platform.OS,
            device_id: await Device.getDeviceIdAsync(),
            raw_data: data,
            exercise_id: exerciseId,
            metadata: {
              platform: Platform.OS,
              model: await Device.getModelNameAsync(),
            },
          };

          await this.sendSensorData(sensorData);
        }
      );

      Sensors.Accelerometer.setUpdateInterval(1000);
      Sensors.Gyroscope.setUpdateInterval(1000);

    } catch (error) {
      console.error('Error starting sensor collection:', error);
      this.stopCollectingSensorData();
    }
  }

  stopCollectingSensorData() {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }
    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }
    this.isCollecting = false;
  }

  private async sendSensorData(data: SensorData) {
    try {
      await api.post('/sensor-data/', data);
    } catch (error) {
      console.error('Error sending sensor data:', error);
    }
  }

  async handleAppleWatchData(data: any) {
    try {
      const sensorData: SensorData = {
        sensor_id: 'apple_watch',
        data_type: data.type,
        device_type: 'apple_watch',
        device_id: data.deviceId,
        raw_data: data.measurements,
        metadata: {
          watchOS: data.watchOS,
          model: data.model,
        },
      };

      await this.sendSensorData(sensorData);
    } catch (error) {
      console.error('Error handling Apple Watch data:', error);
    }
  }

  async handleSmartWatchData(data: any) {
    try {
      const sensorData: SensorData = {
        sensor_id: data.deviceType,
        data_type: data.type,
        device_type: data.deviceType,
        device_id: data.deviceId,
        raw_data: data.measurements,
        metadata: {
          manufacturer: data.manufacturer,
          model: data.model,
          firmware: data.firmware,
        },
      };

      await this.sendSensorData(sensorData);
    } catch (error) {
      console.error('Error handling smartwatch data:', error);
    }
  }

  async cleanup() {
    this.stopCollectingSensorData();
  }
}

export default new SensorService(); 