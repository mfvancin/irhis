import { Stack } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="doctor-homepage" />
      <Stack.Screen name="patient-homepage" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
