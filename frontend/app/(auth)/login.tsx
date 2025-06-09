import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../constants";
import qs from "qs";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleLogin = async (role: 'patient' | 'doctor') => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoadingRole(role);
    try {
      console.log('Starting normal login process...');
      console.log('API URL:', `${API_URL}/token`);
      console.log('Attempting login with:', { email });
      
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      console.log('Request body:', formData.toString());

      console.log('Sending request to:', `${API_URL}/token`);
      const response = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: formData.toString(),
      });

      console.log('Response status:', response.status);
      const headers: { [key: string]: string } = {};
      response.headers.forEach((value: string, key: string) => {
        headers[key] = value;
      });
      console.log('Response headers:', JSON.stringify(headers));
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        throw new Error(data.detail || "Login failed");
      }

      await AsyncStorage.setItem("access_token", data.access_token);
      console.log('Token stored successfully');

      console.log('Fetching user profile...');
      const profileResponse = await fetch(`${API_URL}/users/me`, {
        headers: {
          "Authorization": `Bearer ${data.access_token}`,
          "Accept": "application/json",
        },
      });

      console.log('Profile response status:', profileResponse.status);
      
      if (!profileResponse.ok) {
        console.error('Profile fetch failed with status:', profileResponse.status);
        throw new Error("Failed to fetch user profile");
      }

      const profileData = await profileResponse.json();
      console.log('Profile data:', profileData);
      await AsyncStorage.setItem("userProfile", JSON.stringify(profileData));
      
      // Role-based navigation
      if (profileData.role !== role) {
        Alert.alert(
          "Login Role Mismatch",
          `You logged in as a ${role}, but your account is registered as a ${profileData.role}.`
        );
        router.replace("/(auth)/login"); // Or clear tokens and stay on page
        return;
      }

      if (profileData.role === 'doctor') {
        router.replace("/(tabs)/doctor-homepage");
      } else if (profileData.role === 'patient') {
        router.replace("/(tabs)/patient-homepage");
      } else {
        // Default fallback
        Alert.alert("Unknown Role", "Your user role is not recognized. Please contact support.");
        router.replace("/(auth)/login"); 
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      Alert.alert(
        "Login Failed",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoadingRole(null);
    }
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("/(auth)/landing")} style={styles.backButton}>
        <Image source={require("../../assets/images/back.png")} style={styles.backIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>
        Login to access your <Text style={styles.highlight}>IRHIS</Text> account!
      </Text>

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

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin('patient')} disabled={!!loadingRole}>
        {loadingRole === 'patient' ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.loginButtonText}>Login as Patient</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={[styles.loginButton, styles.doctorButton]} onPress={() => handleLogin('doctor')} disabled={!!loadingRole}>
        {loadingRole === 'doctor' ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.loginButtonText}>Login as Doctor</Text>}
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
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
    marginBottom: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4da1ce",
  },
  subtitle: {
    fontSize: 16,
    color: "#0d1d25",
    marginTop: 10,
    marginBottom: 20,
  },
  inputContainer: {
    marginTop: 20,
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
  label: {
    fontSize: 16,
    color: "#0d1d25",
    marginBottom: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0d1d25",
  },
  forgotPassword: {
    fontSize: 12,
    color: "#4da1ce",
    textAlign: "left",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#4da1ce",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 5,
  },
  doctorButton: {
    backgroundColor: "#1E4D7B",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: "#0d1d25",
  },
  registerLink: {
    fontSize: 16,
    color: "#4da1ce",
    textDecorationLine: "underline",
    marginLeft: 5,
  },
  highlight: {
    color: "#5cc2f8",
    fontWeight: "700",
  },
  icon: {
    width: 16,
    height: 17,
    marginRight: 10,
  },
});

export default Login;
