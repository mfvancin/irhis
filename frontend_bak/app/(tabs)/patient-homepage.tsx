import * as React from "react";
import { StyleSheet, View, Text, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import Header from "../(components)/ScreenComponents/Header";

export default function PatientHomepage() { // Renamed component

    // Placeholder data for assigned plan - replace with actual data fetching
    const assignedPlan = [
        { id: "1", name: "Knee Bends", description: "3 sets of 12 repetitions", scheduled: "Today, 10:00 AM" },
        { id: "2", name: "Leg Raises", description: "3 sets of 15 repetitions", scheduled: "Today, 02:00 PM" },
        { id: "3", name: "Ankle Pumps", description: "4 sets of 20 repetitions", scheduled: "Tomorrow, 09:00 AM" },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <Header />
            <ScrollView style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>Your Rehabilitation Plan</Text>
                {assignedPlan.map((item) => (
                    <View key={item.id} style={styles.planItemCard}>
                        <Text style={styles.planItemName}>{item.name}</Text>
                        <Text style={styles.planItemDescription}>{item.description}</Text>
                        <Text style={styles.planItemScheduled}>Scheduled: {item.scheduled}</Text>
                    </View>
                ))}

                <TouchableOpacity 
                    style={styles.smartwatchButton}
                    onPress={() => router.push("/(tabs)/digital-twin")} // Or specific Movella connection screen
                >
                    <Text style={styles.smartwatchButtonText}>Connect Smartwatch / View Sensor Data</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#fff" 
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
    planItemCard: { 
        padding: 15, 
        borderWidth: 1, 
        borderColor: "#E5E7EB", 
        borderRadius: 15, 
        marginBottom: 10, 
        backgroundColor: '#f9f9f9'
    },
    planItemName: { 
        fontSize: 18, 
        fontWeight: "600", 
        color: "#2a5b7e", 
        marginBottom: 5 
    },
    planItemDescription: { 
        fontSize: 14, 
        color: "#6B7280", 
        marginBottom: 5 
    },
    planItemScheduled: { 
        fontSize: 12, 
        color: "#888" 
    },
    smartwatchButton: {
        backgroundColor: "#4CAF50", // A distinct color for this button
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20,
    },
    smartwatchButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
}); 