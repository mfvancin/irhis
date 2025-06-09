import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants";
import axios from "axios";

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                if (!token) {
                    router.replace("/(auth)/login");
                    return;
                }
                const response = await axios.get(`${API_URL}/users/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (error) {
                Alert.alert("Error", "Failed to load profile data.");
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.clear();
        router.replace("/(auth)/login");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Profile</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#2a5b7e" />
                ) : user ? (
                    <View style={styles.content}>
                        <View style={styles.infoBox}>
                            <Text style={styles.label}>Username</Text>
                            <Text style={styles.value}>{user.username}</Text>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.label}>Email</Text>
                            <Text style={styles.value}>{user.email}</Text>
                        </View>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Text style={styles.errorText}>Could not load profile.</Text>
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f2f5",
    },
    header: {
        backgroundColor: "#fff",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#2a5b7e",
    },
    content: {
        flex: 1,
        padding: 20,
    },
    infoBox: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
    },
    value: {
        fontSize: 18,
        color: '#2a5b7e',
        marginTop: 5,
    },
    logoutButton: {
        backgroundColor: '#d9534f',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    errorText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'red'
    }
});

export default Profile;
