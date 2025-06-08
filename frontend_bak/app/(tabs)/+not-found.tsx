import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";

const NotFoundPage = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.replace("../(auth)/landing");
    }, 10000);
    
    return () => clearTimeout(redirectTimer);
  }, []);
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text 
        style={styles.title}
      >
        TWINREHAB
      </Text>
    
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.notFoundText}>404</Text>
        <Text style={styles.subText}>Page Not Found</Text>
        <Text style={styles.message}>
          The page you are looking for doesn't exist or has been moved
        </Text>
      </Animated.View>
      
      <TouchableOpacity
        style={[styles.button, styles.homeButton]}
        onPress={() => router.replace("../(auth)/landing")}
      >
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>
      
      <Text style={styles.redirectText}>
        Redirecting to home page in a few seconds...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  logo: {
    width: "100%",
    height: 150,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: "#055986",
    marginBottom: 20,
  },
  notFoundText: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#1E4D7B",
    textAlign: "center",
  },
  subText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#055986",
    marginBottom: 15,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    maxWidth: 300,
  },
  button: {
    width: 250,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  homeButton: {
    backgroundColor: "#1E4D7B",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  redirectText: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
  }
});

export default NotFoundPage;