import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DoctorHomepage() {
    const router = useRouter();

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace("/(auth)/login");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                <Text style={styles.title}>Doctor Homepage</Text>
                <Text style={styles.subtitle}>Welcome, Doctor!</Text>
                <TouchableOpacity style={styles.button} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#fff",
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        padding: 20,
        alignItems: 'center'
    },
    title: { 
        fontSize: 24, 
        fontWeight: "bold", 
        color: "#2a5b7e", 
        marginBottom: 10
    },
    subtitle: {
        fontSize: 18,
        color: '#6B7280',
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#d9534f',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
}); 