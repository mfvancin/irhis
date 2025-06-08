import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import Header from "../(components)/ScreenComponents/Header";
import api from "../(services)/api";    

interface DoctorPatientListItem {
    id: number; 
    assigned_date: string;
    status: string;
    patient: {
        id: number; 
        email: string;
        username: string;
        first_name: string;
        last_name: string;
    };
}

export default function DoctorHomepage() {
    const router = useRouter();
    const [assignedPatients, setAssignedPatients] = useState<DoctorPatientListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAssignedPatients = async () => {
            setIsLoading(true);
            try {
                const response = await api.get<DoctorPatientListItem[]>("/doctor-patients/");
                setAssignedPatients(response || []); 
            } catch (error) {
                console.error("Error fetching assigned patients:", error);
                Alert.alert("Error", "Could not fetch your patients.");
                setAssignedPatients([]); 
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssignedPatients();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2a5b7e" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Header />
            <ScrollView style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>Your Patients</Text>
                {assignedPatients.length === 0 && !isLoading ? (
                    <Text style={styles.noPatientsText}>You currently have no patients assigned.</Text>
                ) : (
                    assignedPatients.map((item) => (
                        <TouchableOpacity 
                            key={item.patient.id} 
                            style={styles.patientCard}
                            onPress={() => router.push({
                                pathname: "/(tabs)/patient", 
                                params: { id: item.patient.id.toString() } 
                            })}
                        >
                            <Image style={styles.patientImage} source={require("../../assets/images/user.png")} />
                            <View style={styles.patientInfo}>
                                <Text style={styles.patientName}>{item.patient.first_name} {item.patient.last_name}</Text>
                                <Text style={styles.patientDetails}>Username: {item.patient.username}</Text>
                                <Text style={styles.patientDetails}>Email: {item.patient.email}</Text>
                                <Text style={styles.patientDetails}>Status: {item.status}</Text>
                                <Text style={styles.patientDetails}>Assigned: {new Date(item.assigned_date).toLocaleDateString()}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#fff" 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    contentContainer: { 
        flex: 1, 
        paddingHorizontal: 15 
    },
    sectionTitle: { 
        fontSize: 24, 
        fontWeight: "bold", 
        color: "#2a5b7e", 
        marginVertical: 15 
    },
    patientCard: { 
        flexDirection: "row", 
        alignItems: "center", 
        padding: 15, 
        borderWidth: 1, 
        borderColor: "#E5E7EB", 
        borderRadius: 15, 
        marginBottom: 10,
        backgroundColor: '#f9f9f9'
    },
    patientImage: { 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        marginRight: 20,
        objectFit: 'cover',
        alignSelf: 'center'
    },
    patientInfo: { 
        flex: 1 
    },
    patientName: { 
        fontSize: 18, 
        fontWeight: "600", 
        color: "#2a5b7e", 
        marginBottom: 4 
    },
    patientDetails: { 
        fontSize: 14, 
        lineHeight: 20,
        color: "#6B7280",
        marginBottom: 2,
    },
    noPatientsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#6B7280'
    }
}); 