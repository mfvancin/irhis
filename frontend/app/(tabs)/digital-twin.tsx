import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tab, TabView } from '@rneui/themed';
import DigitalTwinSimulation from '../(components)/DigitalTwin/DigitalTwinSimulation';
import MovellaKinematicsViewer from '../(components)/DigitalTwin/MovellaKinematicsViewer';
import userService from '../(services)/userService';
import { Patient } from '../(types)/models';

export default function DigitalTwinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      
      try {
        const user = await userService.getUserProfile(parseInt(id));
        const patientData: Patient = {
          id: user.id,
          firstName: user.username.split(' ')[0] || user.username,
          lastName: user.username.split(' ')[1] || '',
          age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 0,
          gender: user.gender || 'Unknown',
          healthStatus: 'Unknown',
          medicalHistory: user.medicalConditions || [],
          currentMedications: [],
          vitalSigns: {
            heartRate: 0,
            bloodPressure: { systolic: 0, diastolic: 0 },
            temperature: 0,
            oxygenSaturation: 0,
            bloodGlucose: 0,
            lastUpdated: new Date().toISOString()
          }
        };
        setPatient(patientData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Error</Text>
          <View style={styles.divider} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!patient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Not Found</Text>
          <View style={styles.divider} />
          <Text>Patient not found for ID: {id}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, styles.patientCard]}>
          <View style={styles.patientHeader}>
            <Text style={styles.patientName}>
              {patient.firstName} {patient.lastName}
            </Text>
            <Text style={styles.patientId}>ID: {patient.id}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.patientInfo}>
            <Text style={styles.infoItem}>Age: {patient.age}</Text>
            <Text style={styles.infoItem}>Gender: {patient.gender}</Text>
            <Text style={styles.infoItem}>
              Health Status: <Text style={getHealthStatusStyle(patient.healthStatus)}>
                {patient.healthStatus}
              </Text>
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.mainCard]}>
          <Text style={styles.cardTitle}>
            Digital Twin Analysis
          </Text>
          <View style={styles.divider} />
          
          <Tab
            value={tabIndex}
            onChange={setTabIndex}
            indicatorStyle={{ backgroundColor: '#1976d2' }}
            variant="primary"
            scrollable
          >
            <Tab.Item
              title="Hypothetical Simulations"
              titleStyle={styles.tabTitle}
              containerStyle={tabIndex === 0 ? styles.activeTab : styles.tab}
            />
            <Tab.Item
              title="Movella Kinematics"
              titleStyle={styles.tabTitle}
              containerStyle={tabIndex === 1 ? styles.activeTab : styles.tab}
            />
            <Tab.Item
              title="Info"
              titleStyle={styles.tabTitle}
              containerStyle={tabIndex === 2 ? styles.activeTab : styles.tab}
            />
          </Tab>
          
          <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
            <TabView.Item style={styles.tabContent}>
              {id && <DigitalTwinSimulation patientId={parseInt(id)} />}
            </TabView.Item>
            
            <TabView.Item style={styles.tabContent}>
              <MovellaKinematicsViewer />
            </TabView.Item>

            <TabView.Item style={styles.tabContent}>
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>What is a Digital Twin?</Text>
                <Text style={styles.infoText}>
                  A digital twin is a virtual representation of a patient that simulates how different 
                  factors like medication, exercise, diet, and other interventions might affect health 
                  metrics. This enables healthcare providers to test treatment scenarios in a safe, 
                  virtual environment before applying them to real patients.
                </Text>
                
                <Text style={styles.infoTitle}>Movella DOT Kinematics</Text>
                <Text style={styles.infoText}>
                  This section allows processing of data from a Movella DOT sensor to calculate and visualize kinematic parameters like orientation, position, velocity, and acceleration.
                  Input sample JSON data from the sensor and click 'Process Movella Data' to see the results.
                </Text>

                <Text style={styles.infoTitle}>Important Notes</Text>
                <Text style={styles.infoText}>
                  • Simulation results are estimates, not definitive predictions. Always consult with healthcare providers for medical decisions.
                  • The digital twin functionality is continuously updated with new patient data and models to improve accuracy.
                </Text>
              </View>
            </TabView.Item>
          </TabView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getHealthStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'excellent':
      return styles.statusExcellent;
    case 'good':
      return styles.statusGood;
    case 'fair':
      return styles.statusFair;
    case 'poor':
      return styles.statusPoor;
    default:
      return styles.statusDefault;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  patientCard: {
    borderRadius: 8,
    marginBottom: 16,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientId: {
    fontSize: 14,
    color: '#666',
  },
  patientInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  infoItem: {
    marginRight: 16,
    marginBottom: 8,
  },
  statusExcellent: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  statusGood: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  statusFair: {
    color: '#ed6c02',
    fontWeight: 'bold',
  },
  statusPoor: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  statusDefault: {
    color: '#666',
  },
  mainCard: {
    borderRadius: 8,
    padding: 0,
    overflow: 'hidden',
  },
  tab: {
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#e0e0e0',
  },
  tabTitle: {
    fontSize: 14,
    color: '#333',
  },
  tabContent: {
    width: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});