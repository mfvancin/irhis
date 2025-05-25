// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Card, Tab, TabView } from 'react-native-elements';

// import DigitalTwinSimulation from '../(components)/DigitalTwin/DigitalTwinSimulation';
// import { patientService } from '../(services)/userService';
// import { Patient } from '../(types)/models';

// export default function DigitalTwinScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const [patient, setPatient] = useState<Patient | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [tabIndex, setTabIndex] = useState(0);

//   useEffect(() => {
//     const fetchPatient = async () => {
//       if (!id) return;
      
//       try {
//         const response = await patientService.getPatient(parseInt(id));
//         if (response.error) {
//           setError(response.error);
//         } else if (response.data) {
//           setPatient(response.data);
//         }
//       } catch (err) {
//         setError('Failed to fetch patient data');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPatient();
//   }, [id]);

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#1976d2" />
//       </SafeAreaView>
//     );
//   }

//   if (error) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Card>
//           <Card.Title>Error</Card.Title>
//           <Card.Divider />
//           <Text style={styles.errorText}>{error}</Text>
//         </Card>
//       </SafeAreaView>
//     );
//   }

//   if (!patient) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <Card>
//           <Card.Title>Not Found</Card.Title>
//           <Card.Divider />
//           <Text>Patient not found</Text>
//         </Card>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <Card containerStyle={styles.patientCard}>
//           <View style={styles.patientHeader}>
//             <Text style={styles.patientName}>
//               {patient.firstName} {patient.lastName}
//             </Text>
//             <Text style={styles.patientId}>ID: {patient.id}</Text>
//           </View>
//           <Card.Divider />
//           <View style={styles.patientInfo}>
//             <Text style={styles.infoItem}>Age: {patient.age}</Text>
//             <Text style={styles.infoItem}>Gender: {patient.gender}</Text>
//             <Text style={styles.infoItem}>
//               Health Status: <Text style={getHealthStatusStyle(patient.healthStatus)}>
//                 {patient.healthStatus}
//               </Text>
//             </Text>
//           </View>
//         </Card>

//         <Card containerStyle={styles.mainCard}>
//           <Card.Title style={styles.cardTitle}>
//             Digital Twin Analysis
//           </Card.Title>
//           <Card.Divider />
          
//           <Tab
//             value={tabIndex}
//             onChange={setTabIndex}
//             indicatorStyle={{ backgroundColor: '#1976d2' }}
//             variant="primary"
//           >
//             <Tab.Item
//               title="Simulation"
//               titleStyle={styles.tabTitle}
//               containerStyle={tabIndex === 0 ? styles.activeTab : styles.tab}
//             />
//             <Tab.Item
//               title="Information"
//               titleStyle={styles.tabTitle}
//               containerStyle={tabIndex === 1 ? styles.activeTab : styles.tab}
//             />
//           </Tab>
          
//           <TabView value={tabIndex} onChange={setTabIndex} animationType="spring">
//             <TabView.Item style={styles.tabContent}>
//               {id && <DigitalTwinSimulation patientId={parseInt(id)} />}
//             </TabView.Item>
            
//             <TabView.Item style={styles.tabContent}>
//               <View style={styles.infoContainer}>
//                 <Text style={styles.infoTitle}>What is a Digital Twin?</Text>
//                 <Text style={styles.infoText}>
//                   A digital twin is a virtual representation of a patient that simulates how different 
//                   factors like medication, exercise, diet, and other interventions might affect health 
//                   metrics. This enables healthcare providers to test treatment scenarios in a safe, 
//                   virtual environment before applying them to real patients.
//                 </Text>
                
//                 <Text style={styles.infoTitle}>How to Use This Simulation</Text>
//                 <Text style={styles.infoText}>
//                   1. Select a simulation scenario from the dropdown menu.{'\n'}
//                   2. Adjust the duration and parameters as needed.{'\n'}
//                   3. Click "Run Simulation" to generate results.{'\n'}
//                   4. Analyze the resulting charts and recommendations.{'\n'}
//                   5. Share findings with healthcare providers to inform treatment decisions.
//                 </Text>
                
//                 <Text style={styles.infoTitle}>Important Notes</Text>
//                 <Text style={styles.infoText}>
//                   • This simulation is based on patient data and medical models, but results should be 
//                     considered as estimates, not definitive predictions.{'\n'}
//                   • Always consult with healthcare providers before making medical decisions.{'\n'}
//                   • The digital twin is continuously updated with new patient data to improve accuracy.
//                 </Text>
//               </View>
//             </TabView.Item>
//           </TabView>
//         </Card>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const getHealthStatusStyle = (status: string) => {
//   switch (status?.toLowerCase()) {
//     case 'excellent':
//       return styles.statusExcellent;
//     case 'good':
//       return styles.statusGood;
//     case 'fair':
//       return styles.statusFair;
//     case 'poor':
//       return styles.statusPoor;
//     default:
//       return styles.statusDefault;
//   }
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   scrollContainer: {
//     padding: 12,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   errorText: {
//     color: 'red',
//     textAlign: 'center',
//   },
//   patientCard: {
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   patientHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   patientName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   patientId: {
//     fontSize: 14,
//     color: '#666',
//   },
//   patientInfo: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 8,
//   },
//   infoItem: {
//     marginRight: 16,
//     marginBottom: 8,
//   },
//   statusExcellent: {
//     color: '#2e7d32',
//     fontWeight: 'bold',
//   },
//   statusGood: {
//     color: '#1976d2',
//     fontWeight: 'bold',
//   },
//   statusFair: {
//     color: '#ed6c02',
//     fontWeight: 'bold',
//   },
//   statusPoor: {
//     color: '#d32f2f',
//     fontWeight: 'bold',
//   },
//   statusDefault: {
//     color: '#666',
//   },
//   mainCard: {
//     borderRadius: 8,
//     padding: 0,
//     overflow: 'hidden',
//   },
//   cardTitle: {
//     fontSize: 18,
//     textAlign: 'left',
//     marginLeft: 16,
//     marginTop: 12,
//   },
//   tab: {
//     backgroundColor: '#f0f0f0',
//   },
//   activeTab: {
//     backgroundColor: '#e0e0e0',
//   },
//   tabTitle: {
//     fontSize: 14,
//     color: '#333',
//   },
//   tabContent: {
//     width: '100%',
//   },
//   infoContainer: {
//     padding: 16,
//   },
//   infoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     marginTop: 16,
//   },
//   infoText: {
//     fontSize: 14,
//     lineHeight: 20,
//     color: '#333',
//   },
// });