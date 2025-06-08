import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import { API_URL } from "../constants";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const res = await axios.post(`${API_URL}/auth/forgot-password`, { email });
  
      if (res.data?.message) {
        setResetSent(true);
      } else {
        Alert.alert("Notice", "Request sent, but unexpected response format.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
  
      const errorMsg =
        axios.isAxiosError(error) && error.response?.data
          ? error.response.data.message || error.response.data.detail || "Unknown error"
          : "We couldn't process your request. Please try again later.";
  
      Alert.alert("Password Reset Failed", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Image source={require("../../assets/images/back.png")} style={styles.backIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>
      
      {!resetSent ? (
        <>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you instructions to reset your password.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Image source={require("../../assets/images/at.png")} style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Enter your email address" 
                placeholderTextColor="#c8c8c8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none" 
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Reset instructions have been sent to your email. Please check your inbox.
          </Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.resetButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.helpContainer}>
        <Text style={styles.helpText}>Need help?</Text>
        <TouchableOpacity>
          <Text style={styles.contactLink}>Contact Support</Text>
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
    top: 10,
    left: 20,
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
  resetButton: {
    backgroundColor: "#4da1ce",
    padding: 15,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 30,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  successContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  successText: {
    fontSize: 16,
    color: "#0d1d25",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  helpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  helpText: {
    fontSize: 16,
    color: "#0d1d25",
  },
  contactLink: {
    fontSize: 16,
    color: "#4da1ce",
    textDecorationLine: "underline",
    marginLeft: 5,
  },
  icon: {
    width: 16,
    height: 17,
    marginRight: 10,
  },
});

export default ForgotPassword;