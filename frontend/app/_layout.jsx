import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { CustomHeader } from "../components";
import { theme } from "../constants";
import { useToastConfig } from "../constants/toastConfig";
import { SurveyProvider } from "../context/SurveyContext";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function ThemedToast() {
  const toastConfig = useToastConfig();
  return <Toast config={toastConfig} />;
}

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Figtree-Bold": require("../assets/fonts/Figtree-Bold.ttf"),
    "Petrona-Black": require("../assets/fonts/Petrona-Black.ttf"),
    "Petrona-Light": require("../assets/fonts/Petrona-Light.ttf"),
    "Petrona-Regular": require("../assets/fonts/Petrona-Regular.ttf"),
    "Petrona-SemiBold": require("../assets/fonts/Petrona-SemiBold.ttf"),
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
          <Stack initialRouteName="index">
            <Stack.Screen
              name="index"
              options={{
                header: () => <CustomHeader page="logIn" />,
                gestureEnabled: false,
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/register"
              options={{
                header: () => <CustomHeader page="register" />,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
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
              name="screens/survey/preferences2"
              options={{
                header: () => <CustomHeader page="survey" />,
              }}
            />
            <Stack.Screen
              name="closet/add-item"
              options={{
                header: () => <CustomHeader page="add-item" />,
              }}
            />
            <Stack.Screen
              name="closet/outfitsHistory/itemProperty"
              options={{
                header: () => <CustomHeader page="OutfitDetail" />,
              }}
            />
            <Stack.Screen
              name="closet/outfitsHistory/itemDetail"
              options={{
                header: () => <CustomHeader page="Item" />,
              }}
            />
            <Stack.Screen
              name="closet/outfitsHistory/tripOutfits"
              options={{
                header: () => <CustomHeader page="TripOutfitDetail" />,
              }}
            />
            <Stack.Screen
              name="settings/Profile"
              options={{
                header: () => <CustomHeader page="Profile" />,
              }}
            />
            <Stack.Screen
              name="settings/EditProfile"
              options={{
                header: () => <CustomHeader page="EditProfile" />,
              }}
            />
            <Stack.Screen
              name="settings/UpdatePassword"
              options={{
                header: () => <CustomHeader page="UpdatePassword" />,
              }}
            />
            <Stack.Screen
              name="settings/adminFolder/adminSettings"
              options={{
                header: () => <CustomHeader page="adminSettings" />,
              }}
            />
            <Stack.Screen
              name="settings/adminFolder/adminEditProfile"
              options={{
                header: () => <CustomHeader page="adminEditProfile" />,
              }}
            />
            <Stack.Screen
              name="settings/adminFolder/adminUsers"
              options={{
                header: () => <CustomHeader page="AdminPortal" />,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="settings/adminFolder/adminUpdatePassword"
              options={{
                header: () => <CustomHeader page="AdminChangePassword" />,
              }}
            />
            <Stack.Screen
              name="settings/adminFolder/adminLanding"
              options={{
                header: () => <CustomHeader page="adminwelcomepage" />,
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="settings/adminFolder/adminUserDetail"
              options={{
                header: () => <CustomHeader page="adminUserDetail" />,
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
