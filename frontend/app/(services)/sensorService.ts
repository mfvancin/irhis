import api from './api';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Sensors from 'expo-sensors';
import { Subscription } from 'expo-modules-core';
import { DeviceClient } from 'azure-iot-device';
import { Mqtt as Protocol } from 'azure-iot-device-mqtt';

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

interface AzureMessage {
  type: string;
  rate?: number;
  userId?: number;
  exerciseId?: number;
  [key: string]: any;
}

interface ConnectionStringResponse {
  data: {
    connectionString: string;
  };
}

class SensorService {
  private accelerometerSubscription: Subscription | null = null;
  private gyroscopeSubscription: Subscription | null = null;
  private isCollecting: boolean = false;
  private deviceClient: DeviceClient | null = null;
  private isConnected: boolean = false;

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

      await this.initializeAzureIoT();

      return true;
    } catch (error) {
      console.error('Error initializing sensors:', error);
      return false;
    }
  }

  private async initializeAzureIoT() {
    try {
      const response = await api.get<ConnectionStringResponse>('/azure-iot/connection-string');
      const connectionString = response.data.connectionString;

      this.deviceClient = DeviceClient.fromConnectionString(connectionString, new Protocol());
      
      await this.deviceClient.open();
      this.isConnected = true;
      console.log('Connected to Azure IoT Hub');

      this.deviceClient.on('message', this.handleAzureMessage.bind(this));
    } catch (error) {
      console.error('Error initializing Azure IoT Hub:', error);
      this.isConnected = false;
    }
  }

  private async handleAzureMessage(message: any) {
    try {
      const payload = JSON.parse(message.getBytes().toString()) as AzureMessage;
      console.log('Received message from Azure IoT Hub:', payload);

      switch (payload.type) {
        case 'update_sampling_rate':
          if (payload.rate) {
            await this.updateSamplingRate(payload.rate);
          }
          break;
        case 'start_collection':
          if (payload.userId) {
            await this.startCollectingSensorData(payload.userId, payload.exerciseId);
          }
          break;
        case 'stop_collection':
          this.stopCollectingSensorData();
          break;
        default:
          console.warn('Unknown message type:', payload.type);
      }

      await this.deviceClient?.complete(message);
    } catch (error) {
      console.error('Error handling Azure IoT Hub message:', error);
      await this.deviceClient?.reject(message);
    }
  }

  private async updateSamplingRate(rate: number) {
    if (this.accelerometerSubscription) {
      Sensors.Accelerometer.setUpdateInterval(rate);
    }
    if (this.gyroscopeSubscription) {
      Sensors.Gyroscope.setUpdateInterval(rate);
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
          if (this.isConnected) {
            await this.deviceClient?.sendEvent(JSON.stringify(sensorData));
          }
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
          if (this.isConnected) {
            await this.deviceClient?.sendEvent(JSON.stringify(sensorData));
          }
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
      if (this.isConnected) {
        await this.deviceClient?.sendEvent(JSON.stringify(sensorData));
      }
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
      if (this.isConnected) {
        await this.deviceClient?.sendEvent(JSON.stringify(sensorData));
      }
    } catch (error) {
      console.error('Error handling smartwatch data:', error);
    }
  }

  async cleanup() {
    this.stopCollectingSensorData();
    if (this.deviceClient && this.isConnected) {
      await this.deviceClient.close();
      this.isConnected = false;
    }
  }
}

export default new SensorService(); 