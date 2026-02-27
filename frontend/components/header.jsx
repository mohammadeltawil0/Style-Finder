import { Text, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Logo } from "./ui/logo";
//TO DO: Add a settings page and link the settings icon to it
//TO DO: Add a back button to header based on navigation state

export const CustomHeader = ({ page }) => {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 0, backgroundColor: theme.colors.card, height: 50 }}>
      <View
        style={{
          height: 50,
          backgroundColor: theme.colors.card,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 15,
        }}
      >
        <View
          className="logo-title"
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          {page === "home" && (
            <>
              <Logo />
              {/* unless we want logo to persist for all tabs */}
              <Text
                style={{
                  fontSize: theme.sizes.h2Size,
                  fontWeight: "bold",
                  color: theme.colors.text,
                }}
              >
                Home
              </Text>
            </>
          )}
          {page === "inventory" && (
            <Text
              style={{
                fontSize: theme.sizes.h2Size,
                fontWeight: "bold",
                color: theme.colors.text,
              }}
            >
              Inventory
            </Text>
          )}
          {page === "recommendations" && (
            <Text
              style={{
                fontSize: theme.sizes.h2Size,
                fontWeight: "bold",
                color: theme.colors.text,
              }}
            >
              Recommendations
            </Text>
          )}
        </View>
        <Ionicons name="settings-sharp" size={24} color={theme.colors.text} />
      </View>
    </SafeAreaView>
  );
};
