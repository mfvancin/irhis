import * as React from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import Header from "../(components)/ScreenComponents/Header";

export default function HomepageDoctor() {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <Header />
        <ScrollView style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Models</Text>
            {patients.map((patient, index) => (
                <TouchableOpacity key={index} style={styles.patientCard}
                    onPress={() => router.push({
                        pathname: "/patient",
                        params: { patient: JSON.stringify(patient) }
                    })}
                >
                    <Image style={styles.patientImage} source={patient.image || require("../../assets/images/user.png")} />
                    <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{patient.name}</Text>
                        <Text style={styles.patientDetails}>{patient.age} years old {patient.gender}, {patient.details}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
        </View>
    );
}

const patients = [
    {
        name: "Patient 1", 
        age: 40,
        gender: "male",
        details: "right knee surgery, BMI 20, normal gait.",
        image: require("../../assets/images/patient1.png")
    },
    {
        name: "Patient 2", 
        age: 35,
        gender: "female",
        details: "left hip replacement, BMI 22, slight limp.",
        image: require("../../assets/images/user.png")
    },
    {
        name: "Patient 3", 
        age: 45,
        gender: "male",
        details: "shoulder reconstruction, BMI 24, good mobility.",
        image: require("../../assets/images/user.png")
    }
];

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#fff" 
    },
    filterText: {
        color: "#fff",
        fontWeight: "500"
    },
    spacer: {
        flex: 1
    },
    contentContainer: { 
        flex: 1, 
        paddingHorizontal: 15 
    },
    sectionTitle: { 
        fontSize: 24, 
        fontWeight: "bold", 
        color: "#2a5b7e", 
        marginVertical: 15 
    },
    patientCard: { 
        flexDirection: "row", 
        alignItems: "center", 
        padding: 15, 
        borderWidth: 1, 
        borderColor: "#E5E7EB", 
        borderRadius: 15, 
        marginBottom: 10 
    },
    patientImage: { 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        marginRight: 20,
        objectFit: 'cover',
        alignSelf: 'center'
    },
    patientInfo: { 
        flex: 1 
    },
    patientName: { 
        fontSize: 18, 
        fontWeight: "600", 
        color: "#2a5b7e", 
        marginBottom: 4 
    },
    patientDetails: { 
        fontSize: 14, 
        lineHeight: 20,
        color: "#6B7280" 
    },
    infoButton: { 
        backgroundColor: "#E6F7FF", 
        marginLeft: 5,
        paddingHorizontal: 20, 
        paddingVertical: 6, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: "#5cc2f8" 
    },
    infoButtonText: { 
        color: "#5cc2f8", 
        fontWeight: "500" 
    },
    tabBar: {
        flexDirection: "row",
        height: 60,
        borderTopWidth: 1,
        borderTopColor: "#E5E7EB",
        backgroundColor: "#fff"
    },
    tabItem: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    tabIcon: {
        width: 24,
        height: 24
    }
});