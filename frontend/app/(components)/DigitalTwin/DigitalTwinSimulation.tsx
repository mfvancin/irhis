// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity,Dimensions } from 'react-native';
// import { Card } from 'react-native-paper';
// import { Picker } from '@react-native-picker/picker';
// import { LineChart } from 'react-native-chart-kit';
// import { digitalTwinService } from '../../(services)/digitalTwinService';
// import { MaterialIcons } from '@expo/vector-icons';

// interface SimulationParams {
//   scenario: string;
//   duration: number;
//   parameters: Record<string, any>;
// }

// interface SimulationResult {
//   id: string;
//   status: 'pending' | 'running' | 'completed' | 'failed';
//   startedAt: string;
//   completedAt?: string;
//   results?: {
//     metrics: Record<string, number[]>;
//     timestamps: string[];
//     metadata?: Record<string, any>;
//   };
// }

// interface DigitalTwinSimulationProps {
//   patientId: number;
// }

// const metricColors = {
//   heart_rate: '#ff6384',
//   blood_pressure_systolic: '#36a2eb',
//   blood_pressure_diastolic: '#4bc0c0',
//   blood_glucose: '#ffcd56',
//   oxygen_saturation: '#9966ff'
// };

// export const DigitalTwinSimulation: React.FC<DigitalTwinSimulationProps> = ({ patientId }) => {
//   const [scenario, setScenario] = useState<string>('baseline');
//   const [duration, setDuration] = useState<number>(24);
//   const [parameters, setParameters] = useState<Record<string, any>>({});
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
//   const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['heart_rate', 'blood_glucose']);
//   const [chartData, setChartData] = useState<Array<Record<string, any>>>([]);

//   useEffect(() => {
//     const defaultParams: Record<string, Record<string, any>> = {
//       baseline: {
//         baseHeartRate: 70,
//         baseSystolicBP: 120,
//         baseDiastolicBP: 80,
//         baseGlucose: 100,
//         baseOxygenSaturation: 98
//       },
//       exercise_impact: {
//         baseHeartRate: 70,
//         exerciseIntensity: 'moderate',
//         exerciseDuration: 30,
//         exerciseTime: '08:00'
//       },
//       medication_response: {
//         medicationType: 'antihypertensive',
//         medicationDosage: 'standard',
//         medicationTime: '08:00'
//       }
//     };

//     setParameters(defaultParams[scenario] || {});
//   }, [scenario]);

//   useEffect(() => {
//     if (simulationResult?.status === 'completed' && 
//         simulationResult.results?.metrics && 
//         simulationResult.results?.timestamps) {
      
//       const { metrics, timestamps } = simulationResult.results;
//       const newChartData = timestamps.map((time, index) => {
//         const dataPoint: Record<string, any> = { time: formatTimestamp(time) };
        
//         Object.keys(metrics).forEach(metric => {
//           if (metrics[metric] && metrics[metric][index] !== undefined) {
//             dataPoint[metric] = metrics[metric][index];
//           }
//         });
        
//         return dataPoint;
//       });
      
//       setChartData(newChartData);
//     } else {
//       setChartData([]);
//     }
//   }, [simulationResult]);

//   const formatTimestamp = (timestamp: string): string => {
//     return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const handleRunSimulation = async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const simulationParams: SimulationParams = {
//         scenario,
//         duration,
//         parameters
//       };
      
//       const response = await digitalTwinService.runSimulation(patientId, simulationParams);
      
//       if (response.error) {
//         setError(response.error);
//       } else if (response.data) {
//         setSimulationResult(response.data);
        
//         if (response.data.status === 'running') {
//           pollSimulationStatus(response.data.id);
//         }
//       }
//     } catch (err) {
//       setError('Failed to run simulation. Please try again.');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pollSimulationStatus = async (simulationId: string) => {
//     const interval = setInterval(async () => {
//       try {
//         const response = await digitalTwinService.getSimulationStatus(simulationId);
        
//         if (response.error) {
//           clearInterval(interval);
//           setError(response.error);
//         } else if (response.data) {
//           setSimulationResult(response.data);
          
//           if (response.data.status !== 'running') {
//             clearInterval(interval);
//           }
//         }
//       } catch (err) {
//         clearInterval(interval);
//         setError('Failed to update simulation status');
//         console.error(err);
//       }
//     }, 2000); 
    
//     return () => clearInterval(interval);
//   };

//   const handleParameterChange = (paramName: string, value: any) => {
//     setParameters(prev => ({
//       ...prev,
//       [paramName]: value
//     }));
//   };

//   const screenWidth = Dimensions.get("window").width - 40;

//   return (
//     <ScrollView style={styles.container}>
//       <Card style={styles.card}>
//         <Card.Title title="Simulation Configuration" />
//         <Card.Content>
//           <Text style={styles.label}>Scenario:</Text>
//           <View style={styles.pickerContainer}>
//             <Picker
//               selectedValue={scenario}
//               onValueChange={(value) => setScenario(value)}
//               style={styles.picker}
//             >
//               <Picker.Item label="Baseline" value="baseline" />
//               <Picker.Item label="Exercise Impact" value="exercise_impact" />
//               <Picker.Item label="Medication Response" value="medication_response" />
//             </Picker>
//           </View>
          
//           <Text style={styles.label}>Duration (hours):</Text>
//           <View style={styles.pickerContainer}>
//             <Picker
//               selectedValue={duration}
//               onValueChange={(value) => setDuration(value)}
//               style={styles.picker}
//             >
//               <Picker.Item label="6 hours" value={6} />
//               <Picker.Item label="12 hours" value={12} />
//               <Picker.Item label="24 hours" value={24} />
//               <Picker.Item label="48 hours" value={48} />
//             </Picker>
//           </View>
          
//           <Text style={styles.sectionTitle}>Advanced Parameters:</Text>
          
//           {scenario === 'baseline' && (
//             <>
//               <Text style={styles.label}>Base Heart Rate (bpm):</Text>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={parameters.baseHeartRate}
//                   onValueChange={(value) => handleParameterChange('baseHeartRate', value)}
//                   style={styles.picker}
//                 >
//                   <Picker.Item label="60 bpm" value={60} />
//                   <Picker.Item label="70 bpm" value={70} />
//                   <Picker.Item label="80 bpm" value={80} />
//                   <Picker.Item label="90 bpm" value={90} />
//                 </Picker>
//               </View>
              
//               <Text style={styles.label}>Base Blood Glucose (mg/dL):</Text>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={parameters.baseGlucose}
//                   onValueChange={(value) => handleParameterChange('baseGlucose', value)}
//                   style={styles.picker}
//                 >
//                   <Picker.Item label="80 mg/dL" value={80} />
//                   <Picker.Item label="90 mg/dL" value={90} />
//                   <Picker.Item label="100 mg/dL" value={100} />
//                   <Picker.Item label="110 mg/dL" value={110} />
//                 </Picker>
//               </View>
//             </>
//           )}
          
//           {scenario === 'exercise_impact' && (
//             <>
//               <Text style={styles.label}>Exercise Intensity:</Text>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={parameters.exerciseIntensity}
//                   onValueChange={(value) => handleParameterChange('exerciseIntensity', value)}
//                   style={styles.picker}
//                 >
//                   <Picker.Item label="Light" value="light" />
//                   <Picker.Item label="Moderate" value="moderate" />
//                   <Picker.Item label="Vigorous" value="vigorous" />
//                 </Picker>
//               </View>
              
//               <Text style={styles.label}>Exercise Duration (minutes):</Text>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={parameters.exerciseDuration}
//                   onValueChange={(value) => handleParameterChange('exerciseDuration', value)}
//                   style={styles.picker}
//                 >
//                   <Picker.Item label="15 minutes" value={15} />
//                   <Picker.Item label="30 minutes" value={30} />
//                   <Picker.Item label="45 minutes" value={45} />
//                   <Picker.Item label="60 minutes" value={60} />
//                 </Picker>
//               </View>
//             </>
//           )}
          
//           {scenario === 'medication_response' && (
//             <>
//               <Text style={styles.label}>Medication Type:</Text>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={parameters.medicationType}
//                   onValueChange={(value) => handleParameterChange('medicationType', value)}
//                   style={styles.picker}
//                 >
//                   <Picker.Item label="Antihypertensive" value="antihypertensive" />
//                   <Picker.Item label="Glucose Lowering" value="glucose_lowering" />
//                   <Picker.Item label="Cholesterol Lowering" value="cholesterol_lowering" />
//                 </Picker>
//               </View>
              
//               <Text style={styles.label}>Medication Dosage:</Text>
//               <View style={styles.pickerContainer}>
//                 <Picker
//                   selectedValue={parameters.medicationDosage}
//                   onValueChange={(value) => handleParameterChange('medicationDosage', value)}
//                   style={styles.picker}
//                 >
//                   <Picker.Item label="Low" value="low" />
//                   <Picker.Item label="Standard" value="standard" />
//                   <Picker.Item label="High" value="high" />
//                 </Picker>
//               </View>
//             </>
//           )}
          
//           <TouchableOpacity 
//             style={[styles.button, loading && styles.buttonDisabled]}
//             onPress={handleRunSimulation}
//             disabled={loading}
//           >
//             <Text style={styles.buttonText}>
//               {loading ? 'Running...' : 'Run Simulation'}
//             </Text>
//             {loading && <ActivityIndicator size="small" color="#fff" style={styles.spinner} />}
//           </TouchableOpacity>
          
//           {error && <Text style={styles.error}>{error}</Text>}
//         </Card.Content>
//       </Card>
      
//       {/* Simulation Results Card */}
//       <Card style={styles.card}>
//         <Card.Title 
//           title="Simulation Results" 
//           right={(props) => (
//             <TouchableOpacity onPress={() => {
//             }}>
//               <MaterialIcons name="filter-list" size={24} color="#666" />
//             </TouchableOpacity>
//           )}
//         />
//         <Card.Content>
//           {simulationResult?.status === 'running' ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#1976d2" />
//               <Text style={styles.loadingText}>Processing simulation...</Text>
//             </View>
//           ) : chartData.length > 0 ? (
//             <View>
//               <Text style={styles.sectionTitle}>Metrics Over Time</Text>
              
//               <View style={styles.metricsButtonContainer}>
//                 {Object.keys(metricColors).map(metric => (
//                   <TouchableOpacity
//                     key={metric}
//                     style={[
//                       styles.metricButton,
//                       selectedMetrics.includes(metric) && { backgroundColor: metricColors[metric as keyof typeof metricColors] }
//                     ]}
//                     onPress={() => {
//                       setSelectedMetrics(prev => 
//                         prev.includes(metric) 
//                           ? prev.filter(m => m !== metric) 
//                           : [...prev, metric]
//                       );
//                     }}
//                   >
//                     <Text style={[
//                       styles.metricButtonText, 
//                       selectedMetrics.includes(metric) && styles.selectedMetricText
//                     ]}>
//                       {formatMetricName(metric)}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
              
//               <LineChart
//                 data={{
//                   labels: chartData.map(point => point.time),
//                   datasets: selectedMetrics.map(metric => ({
//                     data: chartData.map(point => point[metric as keyof typeof point] || 0),
//                     color: () => metricColors[metric as keyof typeof metricColors] || '#000',
//                     strokeWidth: 2
//                   }))
//                 }}
//                 width={screenWidth}
//                 height={220}
//                 chartConfig={{
//                   backgroundColor: '#fff',
//                   backgroundGradientFrom: '#fff',
//                   backgroundGradientTo: '#fff',
//                   decimalPlaces: 0,
//                   color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   propsForDots: {
//                     r: '4',
//                     strokeWidth: '1',
//                     stroke: '#fafafa'
//                   },
//                   propsForLabels: {
//                     fontSize: 10
//                   }
//                 }}
//                 bezier
//                 style={styles.chart}
//               />
              
//               <View style={styles.legendContainer}>
//                 {selectedMetrics.map(metric => (
//                   <View key={metric} style={styles.legendItem}>
//                     <View style={[styles.legendColor, { backgroundColor: metricColors[metric as keyof typeof metricColors] }]} />
//                     <Text style={styles.legendText}>{formatMetricName(metric)}</Text>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           ) : (
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>Run a simulation to see results here</Text>
//             </View>
//           )}
          
//           {simulationResult?.status === 'completed' && (
//             <View style={styles.metadataContainer}>
//               <Text style={styles.metadataText}>
//                 Simulation ID: {simulationResult.id}
//               </Text>
//               <Text style={styles.metadataText}>
//                 Completed: {simulationResult.completedAt 
//                   ? new Date(simulationResult.completedAt).toLocaleString() 
//                   : 'N/A'}
//               </Text>
//             </View>
//           )}
//         </Card.Content>
//       </Card>
      
//       {simulationResult?.status === 'completed' && simulationResult.results && (
//         <Card style={styles.card}>
//           <Card.Title title="Simulation Analysis" />
//           <Card.Content>
//             <Text style={styles.sectionTitle}>Key Observations</Text>
//             <Text style={styles.analysisText}>
//               {generateSimulationAnalysis(simulationResult)}
//             </Text>
            
//             <Text style={styles.sectionTitle}>Recommendations</Text>
//             <Text style={styles.analysisText}>
//               {generateRecommendations(simulationResult)}
//             </Text>
//           </Card.Content>
//         </Card>
//       )}
//     </ScrollView>
//   );
// };

// const formatMetricName = (metricKey: string): string => {
//   switch (metricKey) {
//     case 'heart_rate':
//       return 'Heart Rate';
//     case 'blood_pressure_systolic':
//       return 'Systolic BP';
//     case 'blood_pressure_diastolic':
//       return 'Diastolic BP';
//     case 'blood_glucose':
//       return 'Blood Glucose';
//     case 'oxygen_saturation':
//       return 'O₂ Saturation';
//     default:
//       return metricKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//   }
// };

// const generateSimulationAnalysis = (simulation: SimulationResult): string => {
//   if (!simulation.results || !simulation.results.metrics) {
//     return 'No data available for analysis.';
//   }
  
//   const { metrics, timestamps } = simulation.results;
//   const scenario = simulation.results.metadata?.scenario || 'baseline';
  
//   let analysis = '';
  
//   const averages: Record<string, number> = {};
//   const ranges: Record<string, { min: number; max: number }> = {};
  
//   Object.keys(metrics).forEach(metric => {
//     if (!metrics[metric] || metrics[metric].length === 0) return;
    
//     const values = metrics[metric];
//     const sum = values.reduce((a, b) => a + b, 0);
//     averages[metric] = sum / values.length;
    
//     ranges[metric] = {
//       min: Math.min(...values),
//       max: Math.max(...values)
//     };
//   });
  
//   if (metrics.heart_rate) {
//     analysis += `Heart rate averaged ${averages.heart_rate.toFixed(1)} bpm (range: ${ranges.heart_rate.min.toFixed(1)}-${ranges.heart_rate.max.toFixed(1)} bpm). `;
    
//     if (ranges.heart_rate.max > 100) {
//       analysis += 'Peak heart rate indicates periods of elevated cardiovascular activity. ';
//     }
//   }
  
//   if (metrics.blood_glucose) {
//     analysis += `Blood glucose averaged ${averages.blood_glucose.toFixed(1)} mg/dL (range: ${ranges.blood_glucose.min.toFixed(1)}-${ranges.blood_glucose.max.toFixed(1)} mg/dL). `;
    
//     if (ranges.blood_glucose.max > 140) {
//       analysis += 'Glucose levels exceeded normal range at times, indicating potential for improved glucose management. ';
//     }
//   }
  
//   if (metrics.blood_pressure_systolic && metrics.blood_pressure_diastolic) {
//     analysis += `Blood pressure averaged ${averages.blood_pressure_systolic.toFixed(1)}/${averages.blood_pressure_diastolic.toFixed(1)} mmHg. `;
    
//     if (averages.blood_pressure_systolic > 130 || averages.blood_pressure_diastolic > 80) {
//       analysis += 'Average blood pressure was elevated above ideal ranges. ';
//     }
//   }
  
//   if (scenario === 'exercise_impact') {
//     analysis += '\n\nExercise appears to have a significant impact on cardiovascular metrics, with heart rate elevation during activity periods followed by recovery phases. ';
//   } else if (scenario === 'medication_response') {
//     analysis += '\n\nThe simulation indicates that medication timing plays a key role in maintaining stable health metrics throughout the day. ';
//   }
  
//   return analysis || 'Analysis not available for the current simulation data.';
// };

// const generateRecommendations = (simulation: SimulationResult): string => {
//   if (!simulation.results || !simulation.results.metrics) {
//     return 'No data available for recommendations.';
//   }
  
//   const { metrics } = simulation.results;
//   const scenario = simulation.results.metadata?.scenario || 'baseline';
  
//   let recommendations = '';
  
//   const averages: Record<string, number> = {};
  
//   Object.keys(metrics).forEach(metric => {
//     if (!metrics[metric] || metrics[metric].length === 0) return;
    
//     const values = metrics[metric];
//     const sum = values.reduce((a, b) => a + b, 0);
//     averages[metric] = sum / values.length;
//   });
  
//   if (averages.heart_rate > 80) {
//     recommendations += '• Consider regular cardiovascular exercise to improve resting heart rate.\n\n';
//   }
  
//   if (averages.blood_glucose > 110) {
//     recommendations += '• Monitor carbohydrate intake and consider dietary adjustments to improve glucose management.\n\n';
//   }
  
//   if ((averages.blood_pressure_systolic && averages.blood_pressure_systolic > 130) || 
//       (averages.blood_pressure_diastolic && averages.blood_pressure_diastolic > 80)) {
//     recommendations += '• Adopt strategies to manage blood pressure such as reduced sodium intake and stress management.\n\n';
//   }
  
//   if (scenario === 'exercise_impact') {
//     recommendations += '• Based on the response to exercise, a program of moderate activity 3-4 times per week would likely provide cardiovascular benefits.\n\n';
//     recommendations += '• Consider spacing exercise sessions throughout the week rather than consecutive days to optimize recovery.\n\n';
//   } else if (scenario === 'medication_response') {
//     recommendations += '• Current medication timing appears effective, but consider discussing with healthcare provider about adjusting dosage or timing for optimal effect.\n\n';
//     recommendations += '• Regular monitoring is recommended to ensure medication continues to provide expected benefits.\n\n';
//   }
  
//   recommendations += '• Regular monitoring of these health metrics is recommended to track changes over time.\n\n';
//   recommendations += '• Discuss these simulation results with your healthcare provider for personalized guidance.\n\n';
  
//   return recommendations || 'Recommendations not available for the current simulation data.';
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   card: {
//     marginBottom: 16,
//     elevation: 2,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 4,
//     marginTop: 12,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 4,
//     marginBottom: 12,
//   },
//   picker: {
//     height: 50,
//     width: '100%',
//   },
//   button: {
//     backgroundColor: '#1976d2',
//     padding: 14,
//     borderRadius: 4,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 16,
//   },
//   buttonDisabled: {
//     backgroundColor: '#ccc',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   spinner: {
//     marginLeft: 8,
//   },
//   error: {
//     color: 'red',
//     marginTop: 16,
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//   },
//   loadingText: {
//     marginTop: 12,
//     color: '#666',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 40,
//   },
//   emptyText: {
//     color: '#666',
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 8,
//   },
//   metadataContainer: {
//     marginTop: 16,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
//   metadataText: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   legendContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginTop: 8,
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 16,
//     marginBottom: 8,
//   },
//   legendColor: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     marginRight: 4,
//   },
//   legendText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   analysisText: {
//     fontSize: 14,
//     lineHeight: 20,
//     marginBottom: 16,
//   },
//   metricsButtonContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     marginBottom: 16,
//   },
//   metricButton: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     marginRight: 8,
//     marginBottom: 8,
//     backgroundColor: '#f0f0f0',
//   },
//   selectedMetricText: {
//     color: '#fff',
//   },
//   metricButtonText: {
//     fontSize: 12,
//   }
// });

// export default DigitalTwinSimulation;