import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { useRouter } from 'expo-router';
import userService from '../../(services)/userService';
import { User } from '../../(types)/models';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const fetchDashboardData = async () => {
    try {
      if (user.role === 'doctor') {
        const data = await userService.getDoctorDashboard(user.id);
        setStats(data);
      } else {
        const data = await userService.getPatientDashboard(user.id);
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {user.role === 'doctor' ? (
        <DoctorDashboard stats={stats} />
      ) : (
        <PatientDashboard stats={stats} />
      )}
    </ScrollView>
  );
};

const DoctorDashboard: React.FC<{ stats: any }> = ({ stats }) => (
  <View>
    <Card style={styles.card}>
      <Card.Title title="Patient Overview" />
      <Card.Content>
        <View style={styles.statsContainer}>
          <StatItem title="Active Patients" value={stats?.activePatients || 0} />
          <StatItem title="Pending Consultations" value={stats?.pendingConsultations || 0} />
          <StatItem title="Today's Exercises" value={stats?.todayExercises || 0} />
        </View>
      </Card.Content>
    </Card>

    <Card style={styles.card}>
      <Card.Title title="Recent Activities" />
      <Card.Content>
        {stats?.recentActivities?.map((activity: any, index: number) => (
          <View key={index} style={styles.activityItem}>
            <Text style={styles.activityText}>{activity.description}</Text>
            <Text style={styles.activityTime}>{activity.time}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  </View>
);

const PatientDashboard: React.FC<{ stats: any }> = ({ stats }) => (
  <View>
    <Card style={styles.card}>
      <Card.Title title="Health Overview" />
      <Card.Content>
        <View style={styles.statsContainer}>
          <StatItem title="Completed Exercises" value={stats?.completedExercises || 0} />
          <StatItem title="Next Consultation" value={stats?.nextConsultation || 'N/A'} />
          <StatItem title="Progress Score" value={`${stats?.progressScore || 0}%`} />
        </View>
      </Card.Content>
    </Card>

    <Card style={styles.card}>
      <Card.Title title="Today's Schedule" />
      <Card.Content>
        {stats?.todaySchedule?.map((item: any, index: number) => (
          <View key={index} style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>{item.time}</Text>
            <Text style={styles.scheduleText}>{item.description}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  </View>
);

const StatItem: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
  },
  scheduleItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scheduleTime: {
    width: 80,
    fontSize: 14,
    color: '#1976d2',
  },
  scheduleText: {
    flex: 1,
    fontSize: 14,
  },
}); 