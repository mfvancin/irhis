import * as React from "react";
import { StyleSheet, View, Image, Text, TouchableOpacity, StatusBar, TextInput, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import userService from "../(services)/userService";
import { useEffect, useState } from "react";

const Profile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const user = await userService.getUserProfile();
      setFormData({
        name: user.username || "",
        phone: user.emergencyContact?.phone || "",
        email: user.email || ""
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await userService.updateUserProfile({
        username: formData.name,
        email: formData.email,
        emergencyContact: {
          name: formData.name,
          relationship: "self",
          phone: formData.phone
        }
      });
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.profile}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        style={styles.header}
        locations={[0, 1]}
        colors={['#5cc2f8', '#4da1ce']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Image source={require("../../assets/images/back.png")} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.settings}>Settings</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Text style={styles.fieldLabel}>Name</Text>
        <View style={styles.inputField}>
          <TextInput
            style={styles.inputText}
            placeholder="Jane Doe"
            placeholderTextColor="#c8c8c8"
            autoCapitalize="words"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />
        </View>

        <Text style={styles.fieldLabel}>Phone Number</Text>
        <View style={styles.inputField}>
          <TextInput
            style={styles.inputText}
            placeholder="+123 567 89000"
            placeholderTextColor="#c8c8c8"
            keyboardType="phone-pad"
            autoCapitalize="none"
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
          />
        </View>

        <Text style={styles.fieldLabel}>Email</Text>
        <View style={styles.inputField}>
          <TextInput
            style={styles.inputText}
            placeholder="janedoe@example.com"
            placeholderTextColor="#c8c8c8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.updateProfileButton, loading && styles.updateProfileButtonDisabled]}
        onPress={handleUpdateProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.updateProfileText}>Update Profile</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  profile: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    paddingBottom: 35,
  },
  headerContent: {
    width: "100%",
    alignItems: "center",
    paddingTop: 10, 
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 5,
    padding: 10,
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  settings: {
    fontSize: 32,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    textTransform: "capitalize",
    marginTop: 25, 
  },
  formContainer: {
    marginTop: 50,
    paddingHorizontal: 25,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    marginLeft: 10,
    marginBottom: 5,
    textTransform: "capitalize",
  },
  inputField: {
    height: 55,
    borderWidth: 1,
    borderColor: "#5cc2f8",
    borderRadius: 13,
    paddingHorizontal: 15,
    justifyContent: "center",
    marginBottom: 20,
  },
  inputText: {
    fontSize: 16,
    color: "#0d1d25",
  },
  updateProfileButton: {
    backgroundColor: "#4da1ce",
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  updateProfileButtonDisabled: {
    opacity: 0.7,
  },
  updateProfileText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default Profile;
