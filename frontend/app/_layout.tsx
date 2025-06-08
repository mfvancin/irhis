import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    AsyncStorage.removeItem("access_token");
    console.log("Cleared token on app start");
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        console.log("Current token:", token ? "exists" : "none");
        
        const inAuthGroup = segments[0] === "(auth)";
        console.log("Current segment:", segments[0]);

        if (!token) {
          console.log("No token found, redirecting to landing");
          if (!inAuthGroup) {
            router.replace("/(auth)/landing");
          }
        } else {
          try {
            console.log("Verifying token with backend");
            const response = await fetch(`${API_URL}/users/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!response.ok) {
              console.log("Token invalid, clearing and redirecting to landing");
              await AsyncStorage.removeItem("access_token");
              if (!inAuthGroup) {
                router.replace("/(auth)/landing");
              }
            } else if (inAuthGroup) {
              console.log("Token valid, redirecting to homepage");
              router.replace("/(tabs)/homepage");
            }
          } catch (error) {
            console.error("Token verification error:", error);
            await AsyncStorage.removeItem("access_token");
            if (!inAuthGroup) {
              router.replace("/(auth)/landing");
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [segments]);

  if (!loaded || isCheckingAuth) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
