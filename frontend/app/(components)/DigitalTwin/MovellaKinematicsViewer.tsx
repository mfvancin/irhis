import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Dimensions, Alert, Platform } from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { digitalTwinService } from '../../(services)/digitalTwinService';
import { MovellaSensorData, MovellaSimulationOutput } from '../../(types)/models';

const screenWidth = Dimensions.get("window").width - 32; // For card padding

const initialSampleData: MovellaSensorData = {
  device_id: "movella-sample-001",
  timestamp: new Date().toISOString(),
  accelerometer: { x: 0.1, y: 0.2, z: 9.8 },
  gyroscope: { x: 0.01, y: 0.02, z: 0.03 },
  magnetometer: { x: 0.5, y: 0.0, z: -0.5 }
};

const MovellaKinematicsViewer: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [kinematicsResult, setKinematicsResult] = useState<MovellaSimulationOutput | null>(null);
  const [sensorInput, setSensorInput] = useState<string>(JSON.stringify(initialSampleData, null, 2));

  const handleProcessData = async () => {
    setIsLoading(true);
    setError(null);
    setKinematicsResult(null);

    try {
      const parsedInput: MovellaSensorData = JSON.parse(sensorInput);
      // Basic validation
      if (!parsedInput.accelerometer || !parsedInput.gyroscope || !parsedInput.device_id || !parsedInput.timestamp) {
        throw new Error("Invalid sensor data format. Missing required fields.");
      }
      const result = await digitalTwinService.processMovellaData(parsedInput);
      setKinematicsResult(result);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to process sensor data. Please check the input format.';
      setError(errorMessage);
      Alert.alert("Processing Error", errorMessage);
      console.error("Movella processing error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (data: number[], title: string, color: string) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <LineChart
        data={{
          labels: data.map((_, index) => index.toString()), // Simple index labels
          datasets: [{ data, color: () => color, strokeWidth: 2 }]
        }}
        width={screenWidth - 32} // Adjust for padding within card
        height={180}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 8 },
          propsForDots: { r: '3', strokeWidth: '1', stroke: '#fafafa' },
          propsForLabels: { fontSize: 10 }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Movella DOT Data Input" />
        <Card.Content>
          <Text style={styles.label}>Enter Movella Sensor Data (JSON):</Text>
          <TextInput
            style={styles.jsonInput}
            multiline
            numberOfLines={10}
            value={sensorInput}
            onChangeText={setSensorInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleProcessData}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Processing...' : 'Process Movella Data'}
            </Text>
            {isLoading && <ActivityIndicator size="small" color="#fff" style={styles.spinner} />}
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </Card.Content>
      </Card>

      {kinematicsResult && (
        <Card style={styles.card}>
          <Card.Title title="Processed Kinematics" />
          <Card.Content>
            <Text style={styles.resultText}>Device ID: {kinematicsResult.device_id}</Text>
            <Text style={styles.resultText}>Timestamp: {new Date(kinematicsResult.timestamp).toLocaleString()}</Text>
            
            {renderChart([kinematicsResult.orientation.x, kinematicsResult.orientation.y, kinematicsResult.orientation.z, kinematicsResult.orientation.w], 'Orientation (Quaternion)', '#ff6384')}
            {renderChart([kinematicsResult.position.x, kinematicsResult.position.y, kinematicsResult.position.z], 'Position (m)', '#36a2eb')}
            {renderChart([kinematicsResult.velocity.x, kinematicsResult.velocity.y, kinematicsResult.velocity.z], 'Velocity (m/s)', '#4bc0c0')}
            {renderChart([kinematicsResult.acceleration.x, kinematicsResult.acceleration.y, kinematicsResult.acceleration.z], 'Acceleration (m/s²)', '#ffcd56')}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8, // Reduced padding for the outer scroll view
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  jsonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    height: 150, 
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9'
  },
  button: {
    backgroundColor: '#28a745', // Green color for process button
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  spinner: {
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    marginTop: 12,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 4,
  },
  chartContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
    alignSelf: 'center'
  }
});

export default MovellaKinematicsViewer; 