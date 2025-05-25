import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Platform } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../constants";
import qs from "qs";
import * as Google from "expo-auth-session/providers/google";
import { config } from "../config";

interface GoogleResponse {
  id_token: string;
}

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const IOS_CLIENT_ID = config.GOOGLE_CLIENT_ID_IOS;
  const ANDROID_CLIENT_ID = config.GOOGLE_CLIENT_ID_ANDROID;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.OS === 'ios' ? IOS_CLIENT_ID : ANDROID_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin();
    } else if (response?.type === 'error') {
      setIsGoogleLoading(false);
      Alert.alert('Login Failed', response.error?.message || 'Unknown error');
    }
  }, [response]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting normal login process...');
      console.log('API URL:', `${API_URL}/auth/login`);
      console.log('Attempting login with:', { email });
      
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      console.log('Request body:', formData.toString());

      console.log('Sending request to:', `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        body: formData.toString(),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
      
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
      
      router.replace("/(tabs)/homepage");
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
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google login process...');
      setIsGoogleLoading(true);
      const result = await promptAsync();
      console.log('Google login result:', result);

      if (result.type === "success") {
        const { id_token } = result.params;
        console.log('Got ID token from Google');
        
        console.log('Sending token to backend...');
        const response = await fetch(`${API_URL}/auth/google-login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_token }),
        });

        console.log('Backend response status:', response.status);
        const data = await response.json();
        console.log('Backend response data:', data);

        if (!response.ok) {
          console.error('Google login failed with status:', response.status);
          throw new Error(data.detail || "Google login failed");
        }

        await AsyncStorage.setItem("access_token", data.access_token);
        console.log('Token stored successfully');

        console.log('Fetching user profile...');
        const profileResponse = await fetch(`${API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
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
        
        router.replace("/(tabs)/homepage");
      } else {
        console.log('Google login was not successful:', result.type);
      }
    } catch (error) {
      console.error("Google login error:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      Alert.alert(
        "Google Login Failed",
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push("../landing")} style={styles.backButton}>
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

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.loginButtonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.lineView}></Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.googleButton, isGoogleLoading && styles.googleButtonDisabled]}
        onPress={() => {
          setIsGoogleLoading(true);
          promptAsync();
        }}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <ActivityIndicator color="#000" size="small" />
        ) : (
          <>
            <Image source={require("../../assets/images/google.png")} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </>
        )}
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
    marginVertical: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
  googleButtonDisabled: {
    opacity: 0.7,
  },
});

export default Login;
