import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";
import { Logo } from "./ui/logo";
import { usePathname } from "expo-router";

//TO DO: Add a settings page and link the settings icon to it
//TO DO: Add a back button to header based on navigation state

export const CustomHeader = ({ page }) => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 0, backgroundColor: theme.colors.card }}>
      <View
        style={{
          backgroundColor: theme.colors.card,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 30,
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
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                HOME
              </ThemedText>
            </>
          )}
          {page === "closet" && (
            <ThemedText  
              style={{
                fontSize: theme.sizes.h2,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              CLOSET
            </ThemedText>
          )}
          {page === "recommendations" && (
            <ThemedText
              style={{
                fontSize: theme.sizes.h2,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              RECOMMENDATIONS
            </ThemedText>
          )}
          {page === "settings" && (
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                SETTINGS
              </ThemedText>
          )}
          {page === "logIn" && (
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                LOG-IN
              </ThemedText>
            )}
            {page === "register" && (
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                SIGN UP
              </ThemedText>
            )}
        </View>
        {/* <Ionicons name="settings-sharp" size={24} color={theme.colors.text} /> */}
        <TouchableOpacity onPress={() => router.push("/screens/settings")} >
          <Ionicons name="settings-sharp" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
