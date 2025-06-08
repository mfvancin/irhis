import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import axios from "axios";
import { API_URL } from "../../constants";

const Header = () => {
    const [userName, setUserName] = useState<string>("Loading...");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const token = await AsyncStorage.getItem("access_token");
                if (!token) {
                    console.log("No token found in header");
                    return;
                }

                console.log("Fetching user profile with token in header");
                const response = await axios.get(`${API_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: 30000
                });
                
                console.log("User profile response in header:", response.data);
                if (response.data && response.data.username) {
                    setUserName(response.data.username);
                } else {
                    setUserName("User");
                }
            } catch (error: any) {
                console.error('Error fetching user data in header:', error.response?.data || error.message);
                if (error.response?.status === 401) {
                    await AsyncStorage.removeItem("access_token");
                    router.replace("/(auth)/login");
                } else {
                    setUserName("Error loading name");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserName();
    }, []);
    
    return (
        <LinearGradient 
            style={styles.header} 
            colors={["#5cc2f8", "#4da1ce"]} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 0}}
        >
            <SafeAreaView style={styles.headerContent}>
                <View style={styles.iconRow}>
                    <TouchableOpacity 
                        onPress={() => router.push("../(tabs)/profile")} 
                    >
                        <Image 
                            style={styles.icon} 
                            source={require("../../../assets/images/settings.png")} 
                        />
                    </TouchableOpacity>
                    <View style={styles.flexGrow} />
                    <View style={styles.welcomeContainer}>
                        <Text style={styles.welcomeText}>Hi, Welcome Back</Text>
                        <Text style={styles.name}>{userName}</Text>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 10,
        paddingBottom: 20,
        paddingHorizontal: 15,
    },
    headerContent: {
        width: "100%",
    },
    iconRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    icon: {
        width: 30,
        height: 30,
    },
    flexGrow: {
        flex: 1,
    },
    welcomeContainer: {
        alignItems: "flex-end",
        marginRight: 10,
    },
    welcomeText: {
        fontSize: 14,
        color: "#fff",
    },
    name: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    searchBarContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginTop: 15,
    },
    searchBar: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
});

export default Header;
