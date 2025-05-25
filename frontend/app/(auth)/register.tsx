import React, { useState } from "react";
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../constants";
import * as Google from "expo-auth-session/providers/google";

const Register = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState(""); 
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID';  
    const ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID';
    const clientId = Platform.OS === 'ios' ? IOS_CLIENT_ID : ANDROID_CLIENT_ID;
    
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: clientId,
    });

    const handleSignUp = async () => {
        if (!email || !username || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
    
        if (!/\S+@\S+\.\S+/.test(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }
    
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }
    
        setIsLoading(true);
    
        try {
            const userData = {
                email,
                username,
                password
            };
    
            const response = await axios.post(`${API_URL}/auth/register`, userData);
    
            if (response.status === 200 && response.data) {                
                await AsyncStorage.setItem('user', JSON.stringify(response.data));
                router.replace("/(tabs)/homepage");
            } else {
                Alert.alert("Registration Failed", "Please try again later");
            }
        } catch (error) {
            console.error("Registration error:", error);
            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                Alert.alert("Registration Failed", error.response.data.detail);
            } else {
                Alert.alert("Registration Failed", "An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleRegister = async () => {
        try {
          const result = await promptAsync();
    
          if (result.type === 'success') {
            const { id_token } = result.params;
    
            const googleResponse = await axios.post(`${API_URL}/auth/google-register`, { id_token });
    
            const { access_token, user } = googleResponse.data;
    
            if (access_token) {
              await AsyncStorage.setItem("token", access_token);
              if (user) {
                await AsyncStorage.setItem("user", JSON.stringify(user));
              }
    
              axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
              router.replace("/(tabs)/homepage");
            } else {
              Alert.alert("Google Registration Failed", "Invalid response from server");
            }
          }
        } catch (error) {
          console.error("Google Registration error:", error);
          Alert.alert("Registration Failed", "An unexpected error occurred.");
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
              <Text style={styles.bold}> IRHIS</Text>!
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
            <Text style={styles.label}>Your Name</Text>
            <View style={styles.inputWrapper}>
              <Image source={require("../../assets/images/name.png")} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Ex: Saul Ramirez" 
                placeholderTextColor="#c8c8c8"
                value={username}
                onChangeText={setUsername}
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
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signUpText}>Sign up</Text>
            )}
          </TouchableOpacity> 

          <TouchableOpacity>
              <Text style={styles.lineView}></Text>
          </TouchableOpacity>
    
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleRegister}
          >
            <Image source={require("../../assets/images/google.png")} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
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
        marginBottom: 20,
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
        marginVertical: 20,
    },
    signUpText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "700",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    lineView: {
        borderStyle: "solid",
        borderColor: "#0d1d25",
        borderTopWidth: 1,
        flex: 1,
        width: "100%",
        height: 1,
        marginBottom: 20,
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
    googleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#0d1d25",
        padding: 15,
        borderRadius: 16,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    googleButtonText: {
        fontSize: 16,
        color: "#0d1d25",
    },
});

export default Register;
