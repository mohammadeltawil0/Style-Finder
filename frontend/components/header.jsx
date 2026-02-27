import { Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Logo } from "./ui/logo";
//TO DO: Add a settings page and link the settings icon to it
//TO DO: Add a back button to header based on navigation state

export const CustomHeader = ({ page }) => {
  const theme = useTheme();

  return (
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
              {/* TO DO: get the user's name from UserContext here */}
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
      <Ionicons name="settings-sharp" size={24} color="black" />
    </View>
  );
};
