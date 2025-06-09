import React, { useState } from "react";
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../constants";

type UserRole = "patient" | "doctor";

const Register = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
    
    const handleSignUp = async (role: UserRole) => {
        if (!email || !username || !fullName || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
    
        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        if (username.length < 3) {
            Alert.alert("Error", "Username must be at least 3 characters");
            return;
        }
    
        if (password.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters");
            return;
        }
    
        setLoadingRole(role);
    
        try {
            const userData = {
                email,
                username,
                full_name: fullName,
                password,
                role // Include the role
            };
    
            const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    
            if (response.status === 200 && response.data.access_token) {                
                await AsyncStorage.setItem('access_token', response.data.access_token);
                
                try {
                    const profileResponse = await axios.get(`${API_URL}/api/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${response.data.access_token}`
                        }
                    });
                    if (profileResponse.data) {
                        await AsyncStorage.setItem('userProfile', JSON.stringify(profileResponse.data));
                        // Role-based navigation
                        if (profileResponse.data.role === 'doctor') {
                            router.replace("/(tabs)/doctor-homepage");
                        } else if (profileResponse.data.role === 'patient') {
                            router.replace("/(tabs)/patient-homepage");
                        } else {
                            // Default fallback, though ideally role is always doctor or patient
                            Alert.alert("Unknown Role", "Your user role is not recognized. Please contact support.");
                            router.replace("/(auth)/login"); 
                        }
                    } else {
                        Alert.alert("Registration Successful, Login Failed", "Could not fetch user profile.");
                    }
                } catch (profileError) {
                    console.error("Profile fetch error after registration:", profileError);
                    Alert.alert("Registration Successful, Login Failed", "Could not fetch user profile after registration.");
                }
            } else {
                Alert.alert("Registration Failed", response.data.detail || "Please try again later");
            }
        } catch (error) {
            console.error("Registration error:", error);
            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                Alert.alert("Registration Failed", error.response.data.detail);
            } else {
                Alert.alert("Registration Failed", "An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoadingRole(null);
        }
    };
    
    return (
        <View style={styles.register}>
          <TouchableOpacity onPress={() => router.push("/(auth)/landing")} style={styles.backButton}>
            <Image source={require("../../assets/images/back.png")} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.signUpContainer}>
            <Text style={styles.signUp}>Sign up</Text>
            <Text style={styles.description}>
              Create an <Text style={styles.highlight}>account</Text> to access all the features of
              <Text style={styles.bold}> TWINREHAB</Text>!
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Image source={require("../../assets/images/at.png")} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Ex: abc@example.com" 
                placeholderTextColor="#c8c8c8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username (for login)</Text>
            <View style={styles.inputWrapper}>
              <Image source={require("../../assets/images/user.png")} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Choose a login username" 
                placeholderTextColor="#c8c8c8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name (for display)</Text>
            <View style={styles.inputWrapper}>
              <Image source={require("../../assets/images/name.png")} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Ex: Saul Ramirez" 
                placeholderTextColor="#c8c8c8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Password</Text>
            <View style={styles.inputWrapper}>
              <Image source={require("../../assets/images/password.png")} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="••••••••" 
                placeholderTextColor="#c8c8c8" 
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => handleSignUp("patient")}
            disabled={!!loadingRole}
          >
            {loadingRole === 'patient' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Register as Patient</Text>
            )}
          </TouchableOpacity> 

          <TouchableOpacity 
            style={[styles.signUpButton, styles.doctorButton]}
            onPress={() => handleSignUp("doctor")}
            disabled={!!loadingRole}
          >
            {loadingRole === 'doctor' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Register as Doctor</Text>
            )}
          </TouchableOpacity> 

          <View style={styles.loginContainer}>
            <Text style={styles.alreadyHaveAccount}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/login")}> 
              <Text style={styles.login}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

const styles = StyleSheet.create({
    register: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
        justifyContent: "center",
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 5,
        padding: 10,
    },
    backIcon: {
        width: 30,
        height: 30,
        marginBottom: 10,
    },
    signUpContainer: {
        marginBottom: 30,
    },
    signUp: {
        fontSize: 32,
        fontWeight: "700",
        color: "#4da1ce",
    },
    description: {
        fontSize: 16,
        color: "#0d1d25",
        marginTop: 10,
    },
    highlight: {
        color: "#5cc2f8",
        fontWeight: "700",
    },
    bold: {
        fontWeight: "bold",
    },
    inputContainer: {
        marginBottom: 15, // Reduced margin
    },
    label: {
        fontSize: 16,
        color: "#0d1d25",
        marginBottom: 5,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#4da1ce",
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 15,
        height: 50,
    },
    icon: {
        width: 16,
        height: 17,
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#0d1d25",
    },
    signUpButton: {
        backgroundColor: "#4da1ce",
        padding: 15,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 10, // Adjusted margin
        marginBottom: 5, // Adjusted margin
    },
    doctorButton: {
        backgroundColor: "#1E4D7B", // Different color for doctor button
    },
    signUpButtonText: { // Renamed from signUpText for clarity
        fontSize: 16,
        color: "#fff",
        fontWeight: "700",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    alreadyHaveAccount: {
        fontSize: 16,
        color: "#0d1d25",
    },
    login: {
        fontSize: 16,
        color: "#4da1ce",
        textDecorationLine: "underline",
        marginLeft: 5,
    },
});

export default Register;
