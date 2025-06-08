import React, { useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, Dimensions } from "react-native";
import { LineChart } from 'react-native-chart-kit';
import { useLocalSearchParams } from 'expo-router';
import Header from "../(components)/ScreenComponents/Header";
import ProfileModal from "../(components)/PatientModals/ProfileModal";
import ExercisesModal from "../(components)/PatientModals/ExercisesModal";
import ProgressModal from "../(components)/PatientModals/ProgressModal";

const Patient = () => {
    const params = useLocalSearchParams();
    const patient = params.patient ? JSON.parse(params.patient as string) : null;
    
    const patientWithProgress = patient ? {
        ...patient,
        metrics: [
            {
                week: "Week 1",
                kneeFlexion: 65,
                painLevel: 6,
                walkingDistance: 0.5,
                strength: 3,
                balance: 4
            },
            {
                week: "Week 2",
                kneeFlexion: 75,
                painLevel: 5,
                walkingDistance: 1.0,
                strength: 4,
                balance: 5
            },
            {
                week: "Week 3",
                kneeFlexion: 85,
                painLevel: 4,
                walkingDistance: 1.5,
                strength: 5,
                balance: 6
            },
            {
                week: "Week 4",
                kneeFlexion: 90,
                painLevel: 3,
                walkingDistance: 2.0,
                strength: 6,
                balance: 7
            }
        ],
        progress: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            datasets: [
                {
                    data: [65, 75, 85, 90],
                    color: (opacity = 1) => `rgba(42, 91, 126, ${opacity})`,
                }
            ]
        }
    } : null;

    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [exercisesModalVisible, setExercisesModalVisible] = useState(false);
    const [progressModalVisible, setProgressModalVisible] = useState(false);

    if (!patientWithProgress) {
        return (
            <View style={styles.container}>
                <Header />
                <Text style={styles.errorText}>Patient not found</Text>
            </View>
        );
    }

    const chartData = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
            {
                data: [65, 75, 85, 90],
                color: (opacity = 1) => `rgba(42, 91, 126, ${opacity})`,
                strokeWidth: 2
            }
        ]
    };

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(42, 91, 126, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(42, 91, 126, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#5cc2f8"
        }
    };

    const screenWidth = Dimensions.get("window").width - 50;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Header />
            <ScrollView style={styles.contentContainer}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{patientWithProgress.name}</Text>
                    </View>
                </View>
                <View style={styles.section}>
                    <TouchableOpacity 
                        onPress={() => setProfileModalVisible(true)}
                        style={styles.infoBox}
                    >
                        <Text style={styles.subHeader}>Profile</Text>
                        <Text style={styles.infoText}>Age: {patientWithProgress.age}</Text>
                        <Text style={styles.infoText}>Sex: {patientWithProgress.gender}</Text>
                        <Text style={styles.infoText}>Details: {patientWithProgress.details}</Text>
                        <Text style={styles.subHeader}>Next Steps</Text>
                        <Text style={styles.infoText}>1. Physical Therapy:</Text>
                        <Text style={styles.bullet}>• Quad-strengthening exercises (quadriceps set, straight leg raise).</Text>
                        <Text style={styles.bullet}>• Gentle cycling (stationary bike, no resistance).</Text>
                        <Text style={styles.bullet}>• Increase knee flexion goal to 100°+ in 2 weeks.</Text>

                        <Text style={styles.infoText}>2. Pain Management:</Text>
                        <Text style={styles.bullet}>• Medication recommendation.</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Exercises</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.exercisesContainer}
                        onPress={() => setExercisesModalVisible(true)}
                    >
                        {exerciseData.map((exercise, index) => (
                            <View key={index} style={styles.exerciseCard}>
                                <Image source={exercise.image} style={styles.exerciseImage} />
                                <Text style={styles.exerciseText}>{index + 1}. {exercise.title}</Text>
                            </View>
                        ))}
                    </TouchableOpacity>
                </View>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Progress</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.chartContainer}
                        onPress={() => setProgressModalVisible(true)}
                    >
                        <LineChart
                            data={chartData}
                            width={screenWidth}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ProfileModal 
                visible={profileModalVisible}
                onClose={() => setProfileModalVisible(false)}
                patient={patientWithProgress}
            />
            <ExercisesModal 
                visible={exercisesModalVisible}
                onClose={() => setExercisesModalVisible(false)}
                patient={patientWithProgress}
            />
            <ProgressModal 
                visible={progressModalVisible}
                onClose={() => setProgressModalVisible(false)}
                patient={patientWithProgress}
            />
        </View>
    );
};

const exerciseData = [
    {
        title: "Flexion AAROM/ resisted ext.",
        image: require("../../assets/images/exercise1.png")
    },
    {
        title: "Hip Abduction",
        image: require("../../assets/images/exercise2.png")
    },
    {
        title: "Hip Extension",
        image: require("../../assets/images/exercise3.png")
    }
];

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#f2f6fb"
    },
    nameContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 20,
        paddingHorizontal: 15 
    },
    name: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2a5b7e"
    },
    contentContainer: { 
        marginTop: 10,
        flex: 1, 
        paddingHorizontal: 15 
    },
    section: {
        marginTop: 10
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2a5b7e"
    },
    editButton: { 
        backgroundColor: "#E6F7FF", 
        marginLeft: 5,
        paddingHorizontal: 20, 
        paddingVertical: 6, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: "#5cc2f8" 
    },
    editButtonText: { 
        color: "#5cc2f8", 
        fontWeight: "500" 
    },
    infoBox: {
        backgroundColor: "#fff",
        padding: 10,
        marginBottom: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d1d5db"
    },
    infoText: {
        marginBottom: 5,
        fontSize: 14,
        color: "#374151"
    },
    subHeader: {
        margin: 2,
        fontWeight: "bold",
        color: "#111827"
    },
    bullet: {
        marginLeft: 10,
        fontSize: 14,
        color: "#4b5563"
    },
    exercisesContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: 15,
    },
    exerciseCard: {
        marginBottom: 15,
    },
    exerciseImage: {
        width: "100%",
        height: 120,
        borderRadius: 8,
        marginBottom: 8
    },
    exerciseText: {
        fontWeight: "600",
        marginBottom: 4,
        color: "#1f2937"
    },
    chartContainer: {
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 25
    },
    chart: {
        marginVertical: 10,
        borderRadius: 16
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginTop: 20
    }
});

export default Patient;
