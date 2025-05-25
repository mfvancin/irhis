import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, SafeAreaView, StatusBar } from 'react-native';

interface ProfileModalProps {
    visible: boolean;
    onClose: () => void;
    patient: {
        name: string;
        age: number;
        gender: string;
        details: string;
    };
}

const ProfileModal: React.FC<ProfileModalProps> = ({ visible, onClose, patient }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [nextSteps, setNextSteps] = useState({
        physicalTherapy: [
            "Quad-strengthening exercises (quadriceps set, straight leg raise)",
            "Gentle cycling (stationary bike, no resistance)",
            "Increase knee flexion goal to 100°+ in 2 weeks"
        ],
        painManagement: [
            "Medication recommendation"
        ]
    });

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Patient Profile</Text>
                    <TouchableOpacity 
                        onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                        style={styles.editButton}
                    >
                        <Text style={styles.editButtonText}>
                            {isEditing ? 'Save' : 'Edit'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.infoCard}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Name:</Text>
                                <Text style={styles.infoValue}>{patient.name}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Age:</Text>
                                <Text style={styles.infoValue}>{patient.age} years</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Gender:</Text>
                                <Text style={styles.infoValue}>{patient.gender}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Medical Information</Text>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoText}>{patient.details}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Treatment Plan</Text>
                        <View style={styles.infoCard}>
                            <Text style={styles.subSectionTitle}>1. Physical Therapy:</Text>
                            {isEditing ? (
                                <View style={styles.editContainer}>
                                    {nextSteps.physicalTherapy.map((step, index) => (
                                        <TextInput
                                            key={index}
                                            style={styles.editInput}
                                            value={step}
                                            onChangeText={(text) => {
                                                const newSteps = [...nextSteps.physicalTherapy];
                                                newSteps[index] = text;
                                                setNextSteps({...nextSteps, physicalTherapy: newSteps});
                                            }}
                                            multiline
                                        />
                                    ))}
                                    <TouchableOpacity 
                                        style={styles.addButton}
                                        onPress={() => {
                                            setNextSteps({
                                                ...nextSteps,
                                                physicalTherapy: [...nextSteps.physicalTherapy, ""]
                                            });
                                        }}
                                    >
                                        <Text style={styles.addButtonText}>+ Add Step</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                nextSteps.physicalTherapy.map((step, index) => (
                                    <Text key={index} style={styles.bullet}>• {step}</Text>
                                ))
                            )}

                            <Text style={styles.subSectionTitle}>2. Pain Management:</Text>
                            {isEditing ? (
                                <View style={styles.editContainer}>
                                    {nextSteps.painManagement.map((step, index) => (
                                        <TextInput
                                            key={index}
                                            style={styles.editInput}
                                            value={step}
                                            onChangeText={(text) => {
                                                const newSteps = [...nextSteps.painManagement];
                                                newSteps[index] = text;
                                                setNextSteps({...nextSteps, painManagement: newSteps});
                                            }}
                                            multiline
                                        />
                                    ))}
                                    <TouchableOpacity 
                                        style={styles.addButton}
                                        onPress={() => {
                                            setNextSteps({
                                                ...nextSteps,
                                                painManagement: [...nextSteps.painManagement, ""]
                                            });
                                        }}
                                    >
                                        <Text style={styles.addButtonText}>+ Add Step</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                nextSteps.painManagement.map((step, index) => (
                                    <Text key={index} style={styles.bullet}>• {step}</Text>
                                ))
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6fb',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2a5b7e',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#4da1ce',
    },
    editButton: {
        padding: 8,
    },
    editButtonText: {
        fontSize: 16,
        color: '#4da1ce',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2a5b7e',
        marginBottom: 12,
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    infoLabel: {
        width: 80,
        fontSize: 16,
        color: '#6B7280',
    },
    infoValue: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    infoText: {
        fontSize: 16,
        color: '#1F2937',
        lineHeight: 24,
    },
    bullet: {
        fontSize: 16,
        color: '#4B5563',
        marginLeft: 16,
        marginBottom: 8,
        lineHeight: 24,
    },
    editContainer: {
        marginLeft: 16,
    },
    editInput: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        fontSize: 16,
        color: '#1F2937',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    addButton: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#E6F7FF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4da1ce',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#4da1ce',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ProfileModal; 