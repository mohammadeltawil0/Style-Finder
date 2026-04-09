import { Image, View } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Profile() {
  const theme = useTheme();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await AsyncStorage.getItem("username");
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    loadUsername();
  }, []);

  return (
    <ThemedView
      gradient
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <View className="header" style={{ alignSelf: "flex-start" }}>
        <ThemedText
          style={{
            fontSize: theme.sizes.h1,
            fontFamily: theme.fonts.bold,
            color: theme.colors.text,
          }}
        >
          Manage Account
        </ThemedText>
      </View>
      <View
        className="content"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Image
          source={require("../../assets/images/placeholder.png")}
          style={{
            borderRadius: 10,
            width: 200,
            height: 200,
            marginBottom: 20,
            fontFamily: theme.fonts.bold,
            color: theme.colors.text,
          }}
          resizeMode="cover"
        />
        <ThemedText
          style={{
            fontSize: theme.sizes.h2,
            color: theme.colors.h2,
            fontFamily: theme.fonts.bold,
          }}
        >
          {username}
        </ThemedText>
        <View className="profile-options-1">
          <ThemedText
            style={{ fontSize: theme.sizes.h3, color: theme.colors.text }}
          >
            EDIT PROFILE
          </ThemedText>
          <ThemedText
            style={{ fontSize: theme.sizes.h3, color: theme.colors.text }}
          >
            CHANGE PASSWORD
          </ThemedText>
        </View>
        <View className="profile-options-2">
          <ThemedText
            style={{ fontSize: theme.sizes.h3, color: theme.colors.text }}
          >
            PREFERENCES SURVEY
          </ThemedText>
          <ThemedText
            style={{ fontSize: theme.sizes.h3, color: theme.colors.text }}
          >
            LOG OUT
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

export default Profile;
