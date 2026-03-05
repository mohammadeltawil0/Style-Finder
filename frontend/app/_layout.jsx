import {
  ThemeProvider
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { theme } from "../constants";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { CustomHeader } from "../components";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Figtree-Bold': require('../assets/fonts/Figtree-Bold.ttf'),
    'Petrona-Black': require('../assets/fonts/Petrona-Black.ttf'),
    'Petrona-Light': require('../assets/fonts/Petrona-Light.ttf'),
    'Petrona-Regular': require('../assets/fonts/Petrona-Regular.ttf'),
    'Petrona-SemiBold': require('../assets/fonts/Petrona-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null; // Return nothing while loading
  }

  return (
    <ThemeProvider value={theme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="screens/settings"
          options={{
            header: () => <CustomHeader page="settings" />,
          }}
        />
        <Stack.Screen
          name="auth/logIn"
          options={{
            header: () => <CustomHeader page="logIn" />,
          }}
        />
        <Stack.Screen
          name="auth/register"
          options={{
            header: () => <CustomHeader page="register" />,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="closet/add-item"
          options={{
            header: () => <CustomHeader page="add-item" />,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
