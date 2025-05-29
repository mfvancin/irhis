declare module 'azure-iot-device' {
  export class DeviceClient {
    static fromConnectionString(connectionString: string, protocol: any): DeviceClient;
    open(): Promise<void>;
    close(): Promise<void>;
    sendEvent(message: string): Promise<void>;
    on(event: string, callback: (message: any) => void): void;
    complete(message: any): Promise<void>;
    reject(message: any): Promise<void>;
  }
}

declare module 'azure-iot-device-mqtt' {
  export class Mqtt {
    constructor();
  }
} 