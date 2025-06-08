import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, SafeAreaView, StatusBar, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Exercise {
    id: string;
    title: string;
    image: any;
    description: string;
    sets: number;
    reps: number;
    frequency: string;
}

interface ExercisesModalProps {
    visible: boolean;
    onClose: () => void;
    patient: {
        name: string;
    };
}

const ExercisesModal: React.FC<ExercisesModalProps> = ({ visible, onClose, patient }) => {
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const allExercises: Exercise[] = [
        {
            id: '1',
            title: "Flexion AAROM/ resisted ext.",
            image: require("../../../assets/images/exercise1.png"),
            description: "Gentle knee flexion with assistance",
            sets: 3,
            reps: 10,
            frequency: "Daily"
        },
        {
            id: '2',
            title: "Hip Abduction",
            image: require("../../../assets/images/exercise2.png"),
            description: "Side-lying hip abduction",
            sets: 3,
            reps: 12,
            frequency: "Daily"
        },
        {
            id: '3',
            title: "Hip Extension",
            image: require("../../../assets/images/exercise3.png"),
            description: "Prone hip extension",
            sets: 3,
            reps: 12,
            frequency: "Daily"
        },
        {
            id: '4',
            title: "Quad Sets",
            image: require("../../../assets/images/exercise1.png"),
            description: "Isometric quadriceps strengthening",
            sets: 3,
            reps: 15,
            frequency: "Daily"
        },
        {
            id: '5',
            title: "Straight Leg Raises",
            image: require("../../../assets/images/exercise2.png"),
            description: "Supine straight leg raises",
            sets: 3,
            reps: 10,
            frequency: "Daily"
        }
    ];

    const filteredExercises = allExercises.filter(exercise => 
        !selectedExercises.find(selected => selected.id === exercise.id) &&
        exercise.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectExercise = (exercise: Exercise) => {
        setSelectedExercises([...selectedExercises, exercise]);
    };

    const handleRemoveExercise = (exerciseId: string) => {
        setSelectedExercises(selectedExercises.filter(ex => ex.id !== exerciseId));
    };

    const handleMoveExercise = (fromIndex: number, toIndex: number) => {
        const newSelectedExercises = [...selectedExercises];
        const [movedExercise] = newSelectedExercises.splice(fromIndex, 1);
        newSelectedExercises.splice(toIndex, 0, movedExercise);
        setSelectedExercises(newSelectedExercises);
    };

    const handleSave = () => {
        // Here you would typically save the selected exercises to your backend
        onClose();
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
                    <Text style={styles.headerTitle}>Exercise Plan</Text>
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Selected Exercises</Text>
                        {selectedExercises.length === 0 ? (
                            <Text style={styles.emptyText}>No exercises selected</Text>
                        ) : (
                            selectedExercises.map((exercise, index) => (
                                <View key={exercise.id} style={styles.selectedExerciseCard}>
                                    <View style={styles.exerciseHeader}>
                                        <View style={styles.dragHandle}>
                                            <MaterialIcons name="drag-handle" size={24} color="#6B7280" />
                                        </View>
                                        <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                                        <TouchableOpacity 
                                            onPress={() => handleRemoveExercise(exercise.id)}
                                            style={styles.removeButton}
                                        >
                                            <MaterialIcons name="close" size={24} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                    <Image source={exercise.image} style={styles.exerciseImage} />
                                    <View style={styles.exerciseDetails}>
                                        <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                                        <View style={styles.exerciseStats}>
                                            <Text style={styles.statText}>Sets: {exercise.sets}</Text>
                                            <Text style={styles.statText}>Reps: {exercise.reps}</Text>
                                            <Text style={styles.statText}>Frequency: {exercise.frequency}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Exercises</Text>
                        <View style={styles.searchContainer}>
                            <MaterialIcons name="search" size={24} color="#6B7280" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search exercises..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        {filteredExercises.map(exercise => (
                            <TouchableOpacity
                                key={exercise.id}
                                style={styles.availableExerciseCard}
                                onPress={() => handleSelectExercise(exercise)}
                            >
                                <Image source={exercise.image} style={styles.availableExerciseImage} />
                                <View style={styles.availableExerciseInfo}>
                                    <Text style={styles.availableExerciseTitle}>{exercise.title}</Text>
                                    <Text style={styles.availableExerciseDescription}>{exercise.description}</Text>
                                </View>
                                <MaterialIcons name="add-circle-outline" size={24} color="#4da1ce" />
                            </TouchableOpacity>
                        ))}
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
    saveButton: {
        padding: 8,
    },
    saveButtonText: {
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
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        padding: 20,
    },
    selectedExerciseCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    exerciseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dragHandle: {
        marginRight: 8,
    },
    exerciseTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    removeButton: {
        padding: 4,
    },
    exerciseImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    exerciseDetails: {
        gap: 8,
    },
    exerciseDescription: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    exerciseStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8,
    },
    statText: {
        fontSize: 14,
        color: '#374151',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#1F2937',
    },
    availableExerciseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    availableExerciseImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    availableExerciseInfo: {
        flex: 1,
    },
    availableExerciseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    availableExerciseDescription: {
        fontSize: 14,
        color: '#6B7280',
    },
});

export default ExercisesModal; 