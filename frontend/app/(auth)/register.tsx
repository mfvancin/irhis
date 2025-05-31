import React, { useState } from "react";
import { Image, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../constants";

const Register = () => {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [role, setRole] = useState<"patient" | "doctor">("patient");
    const [specialization, setSpecialization] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [medicalHistory, setMedicalHistory] = useState("");
    const [currentCondition, setCurrentCondition] = useState("");
    const [surgeryDate, setSurgeryDate] = useState("");
    const [surgeryType, setSurgeryType] = useState("");

    const handleSignUp = async () => {
        if (!email || !password || !username || !firstName || !lastName) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        if (role === "doctor" && (!specialization || !licenseNumber)) {
            Alert.alert("Error", "Please fill in all required doctor fields");
            return;
        }

        if (role === "patient" && (!medicalHistory || !currentCondition)) {
            Alert.alert("Error", "Please fill in all required patient fields");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                email,
                password,
                username,
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
                date_of_birth: dateOfBirth,
                role,
                specialization: role === "doctor" ? specialization : undefined,
                license_number: role === "doctor" ? licenseNumber : undefined,
                medical_history: role === "patient" ? medicalHistory : undefined,
                current_condition: role === "patient" ? currentCondition : undefined,
            });

            if (response.data.access_token) {
                await AsyncStorage.setItem("access_token", response.data.access_token);
                router.replace("/(tabs)/homepage");
            }
        } catch (error: any) {
            Alert.alert(
                "Registration Failed",
                error.response?.data?.detail || "An error occurred during registration"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.push("../landing")} style={styles.backButton}>
                <Image source={require("../../assets/images/back.png")} style={styles.backIcon} />
            </TouchableOpacity>

            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>
                Create your <Text style={styles.highlight}>IRHIS</Text> account!
            </Text>

            <View style={styles.roleContainer}>
                <TouchableOpacity
                    style={[styles.roleButton, role === "patient" && styles.roleButtonActive]}
                    onPress={() => setRole("patient")}
                >
                    <Text style={[styles.roleButtonText, role === "patient" && styles.roleButtonTextActive]}>
                        Patient
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.roleButton, role === "doctor" && styles.roleButtonActive]}
                    onPress={() => setRole("doctor")}
                >
                    <Text style={[styles.roleButtonText, role === "doctor" && styles.roleButtonTextActive]}>
                        Doctor
                    </Text>
                </TouchableOpacity>
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
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                    <Image source={require("../../assets/images/user.png")} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Choose a username"
                        placeholderTextColor="#c8c8c8"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
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

            <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            placeholderTextColor="#c8c8c8"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>
                </View>

                <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            placeholderTextColor="#c8c8c8"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                    <Image source={require("../../assets/images/phone.png")} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your phone number"
                        placeholderTextColor="#c8c8c8"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Date of Birth</Text>
                <View style={styles.inputWrapper}>
                    <Image source={require("../../assets/images/calendar.png")} style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#c8c8c8"
                        value={dateOfBirth}
                        onChangeText={setDateOfBirth}
                    />
                </View>
            </View>

            {role === "doctor" ? (
                <>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Specialization</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your specialization"
                                placeholderTextColor="#c8c8c8"
                                value={specialization}
                                onChangeText={setSpecialization}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>License Number</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your license number"
                                placeholderTextColor="#c8c8c8"
                                value={licenseNumber}
                                onChangeText={setLicenseNumber}
                            />
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Medical History</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Enter your medical history"
                                placeholderTextColor="#c8c8c8"
                                value={medicalHistory}
                                onChangeText={setMedicalHistory}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Current Condition</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Describe your current condition"
                                placeholderTextColor="#c8c8c8"
                                value={currentCondition}
                                onChangeText={setCurrentCondition}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Surgery Date</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#c8c8c8"
                                value={surgeryDate}
                                onChangeText={setSurgeryDate}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Surgery Type</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter surgery type"
                                placeholderTextColor="#c8c8c8"
                                value={surgeryType}
                                onChangeText={setSurgeryType}
                            />
                        </View>
                    </View>
                </>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.signUpButtonText}>Sign Up</Text>}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                    <Text style={styles.loginLink}>Login</Text>
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
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#4da1ce",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#0d1d25",
        marginTop: 10,
    },
    highlight: {
        color: "#5cc2f8",
        fontWeight: "700",
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
    roleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#4da1ce',
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    roleButtonActive: {
        backgroundColor: '#4da1ce',
    },
    roleButtonText: {
        fontSize: 16,
        color: '#4da1ce',
        fontWeight: '600',
    },
    roleButtonTextActive: {
        color: '#fff',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
    signUpButton: {
        backgroundColor: "#4da1ce",
        padding: 15,
        borderRadius: 16,
        alignItems: "center",
        marginVertical: 20,
    },
    signUpButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "700",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    loginText: {
        fontSize: 16,
        color: "#0d1d25",
    },
    loginLink: {
        fontSize: 16,
        color: "#4da1ce",
        textDecorationLine: "underline",
        marginLeft: 5,
    },
});

export default Register;
