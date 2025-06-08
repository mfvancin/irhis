import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons';

interface ProgressModalProps {
    visible: boolean;
    onClose: () => void;
    patient: {
        name: string;
        progress?: {
            labels: string[];
            datasets: Array<{
                data: number[];
                color?: (opacity: number) => string;
            }>;
        };
        metrics?: Array<{
            week: string;
            kneeFlexion: number;
            painLevel: number;
            walkingDistance: number;
            strength: number;
            balance: number;
        }>;
    };
}

const ProgressModal: React.FC<ProgressModalProps> = ({ visible, onClose, patient }) => {
    console.log('ProgressModal rendered with patient:', patient);

    const defaultChartData = {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
        datasets: [
            {
                data: [65, 75, 85, 90],
                color: (opacity = 1) => `rgba(42, 91, 126, ${opacity})`,
            }
        ]
    };

    const defaultMetrics = [
        {
            week: "Week 1",
            kneeFlexion: 65,
            painLevel: 6,
            walkingDistance: 0.5,
            strength: 3,
            balance: 4
        },
        {
            week: "Week 2",
            kneeFlexion: 75,
            painLevel: 5,
            walkingDistance: 1.0,
            strength: 4,
            balance: 5
        },
        {
            week: "Week 3",
            kneeFlexion: 85,
            painLevel: 4,
            walkingDistance: 1.5,
            strength: 5,
            balance: 6
        },
        {
            week: "Week 4",
            kneeFlexion: 90,
            painLevel: 3,
            walkingDistance: 2.0,
            strength: 6,
            balance: 7
        }
    ];

    const chartData = patient?.progress || defaultChartData;
    const metrics = patient?.metrics || defaultMetrics;

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(42, 91, 126, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
    };

    const renderChart = (title: string, data: number[], color: string) => (
        <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>{title}</Text>
            <LineChart
                data={{
                    labels: chartData.labels,
                    datasets: [{
                        data,
                        color: (opacity = 1) => color,
                    }]
                }}
                width={Dimensions.get('window').width - 80}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
            />
        </View>
    );

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
                    <Text style={styles.headerTitle}>Progress Report</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Progress Summary</Text>
                        <View style={styles.metricsGrid}>
                            {metrics.map((metric, index) => (
                                <View key={index} style={styles.metricCard}>
                                    <Text style={styles.metricTitle}>{metric.week}</Text>
                                    <Text style={styles.metricValue}>Knee Flexion: {metric.kneeFlexion}°</Text>
                                    <Text style={styles.metricValue}>Pain Level: {metric.painLevel}/10</Text>
                                    <Text style={styles.metricValue}>Walking Distance: {metric.walkingDistance}km</Text>
                                    <Text style={styles.metricValue}>Strength: {metric.strength}/10</Text>
                                    <Text style={styles.metricValue}>Balance: {metric.balance}/10</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Progress Charts</Text>
                        {renderChart("Knee Flexion Progress", metrics.map(m => m.kneeFlexion), "rgba(42, 91, 126, 1)")}
                        {renderChart("Pain Level Trend", metrics.map(m => m.painLevel), "rgba(220, 53, 69, 1)")}
                        {renderChart("Walking Distance Progress", metrics.map(m => m.walkingDistance), "rgba(40, 167, 69, 1)")}
                        {renderChart("Strength Progress", metrics.map(m => m.strength), "rgba(255, 193, 7, 1)")}
                        {renderChart("Balance Progress", metrics.map(m => m.balance), "rgba(23, 162, 184, 1)")}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Understanding Your Progress</Text>
                        <View style={styles.explanationCard}>
                            <Text style={styles.explanationTitle}>Knee Flexion</Text>
                            <Text style={styles.explanationText}>
                                Measures the range of motion in your knee. The goal is to achieve full flexion (135°). 
                                Your current progress shows steady improvement.
                            </Text>
                        </View>
                        <View style={styles.explanationCard}>
                            <Text style={styles.explanationTitle}>Pain Level</Text>
                            <Text style={styles.explanationText}>
                                Rated on a scale of 0-10, where 0 is no pain and 10 is severe pain. 
                                The decreasing trend indicates effective pain management.
                            </Text>
                        </View>
                        <View style={styles.explanationCard}>
                            <Text style={styles.explanationTitle}>Walking Distance</Text>
                            <Text style={styles.explanationText}>
                                Tracks your ability to walk without assistance. 
                                The increasing distance shows improved mobility and endurance.
                            </Text>
                        </View>
                        <View style={styles.explanationCard}>
                            <Text style={styles.explanationTitle}>Strength & Balance</Text>
                            <Text style={styles.explanationText}>
                                Combined metrics showing muscle strength and stability. 
                                Both are crucial for recovery and preventing future injuries.
                            </Text>
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
    placeholder: {
        width: 40,
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
        textAlign: 'center',
    },
    metricsGrid: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
    },
    metricCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    metricTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2a5b7e',
        marginBottom: 12,
        textAlign: 'center',
    },
    metricValue: {
        fontSize: 15,
        color: '#4a5568',
        marginBottom: 6,
        textAlign: 'center',
    },
    chartContainer: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    explanationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    explanationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2a5b7e',
        marginBottom: 8,
    },
    explanationText: {
        fontSize: 14,
        color: '#4a5568',
        lineHeight: 20,
    },
});

export default ProgressModal; 