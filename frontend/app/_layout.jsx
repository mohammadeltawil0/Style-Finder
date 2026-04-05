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
import { SurveyProvider } from "../context/SurveyContext";
import Toast from 'react-native-toast-message';
import { useToastConfig } from "constants/toastConfig";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function ThemedToast() {
  const toastConfig = useToastConfig();
  return <Toast config={toastConfig} />;
}


export const unstable_settings = {
  initialRouteName: "auth/logIn",
  anchor: "(tabs)",
};

function ThemedToast() {
  const toastConfig = useToastConfig();
  return <Toast config={toastConfig} />;
}

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <SurveyProvider>
          <Stack initialRouteName="auth/logIn">
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
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="screens/settings"
              options={{
                header: () => <CustomHeader page="settings" />,
              }}
            />
            <Stack.Screen
              name="screens/survey/preferences1"
              options={{
                header: () => <CustomHeader page="survey" />,
              }}
            />
            <Stack.Screen
              name="screens/AdditionalConstraints"
              options={{
                header: () => <CustomHeader page="AdditionalConstraints" />,
              }}
            />
            <Stack.Screen
              name="screens/OutfitswaitingScreen"
              options={{
                header: () => <CustomHeader page="OutfitswaitingScreen" />,
              }}
            />
            <Stack.Screen
              name="screens/DisplayOutfits"
              options={{
                header: () => <CustomHeader page="AdditionalConstraints" />,
              }}
            />
            <Stack.Screen
              name="screens/survey/preferences2"
              options={{
                header: () => <CustomHeader page="survey" />,
              }}
            />
            {/* <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Modal" }}
            /> */}
            <Stack.Screen
              name="closet/add-item"
              options={{
                header: () => <CustomHeader page="add-item" />,
              }}
            />
            <Stack.Screen
              name="closet/outfitsHistory/itemProperty"
              options={{
                header: () => <CustomHeader page="RegularOutfitDetail" />,
              }}
            />
            <Stack.Screen
              name="closet/outfitsHistory/tripOutfits"
              options={{
                header: () => <CustomHeader page="TripOutfitDetail" />,
              }}
            />
          </Stack>
          <StatusBar style="auto" />
          <ThemedToast />
        </SurveyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
