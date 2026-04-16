import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import ProfilePic from "../../../components/profile-pic";
import { useSurvey } from "../../../context/SurveyContext";

function AdminSettings() {
  const theme = useTheme();
  const router = useRouter();
  const { resetAnswers } = useSurvey();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  const handleLogout = async () => {
    resetAnswers();
    await AsyncStorage.multiRemove(["username", "userId", "profileImageUrl", "role"]);
    router.replace("/");
  };

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        const storedUsername = await AsyncStorage.getItem("username");
        const storedName = await AsyncStorage.getItem("name");

        if (storedUsername) setUsername(storedUsername);
        if (storedName) setName(storedName);
      };

      loadProfile();
    }, []),
  );

  return (
    <ThemedView
      gradient
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <View
        style={{
          flex: 1,
          width: "80%",
          paddingHorizontal: 20,
          paddingVertical: 30,
          alignItems: "stretch",
          gap: 40,
        }}
      >
        {/* Profile pic + username — same as user Profile */}
        <View style={{ alignItems: "center", gap: 12 }}>
          <ProfilePic
            username={username}
            style={{ height: 200, width: 200 }}
            onPress={() =>
              router.push("/settings/adminFolder/adminEditProfile")
            }
            containerStyle={{
              backgroundColor: "transparent",
              padding: 0,
              borderRadius: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 12,
            }}
          />
          <ThemedText
            style={{
              fontSize: theme.sizes.h2,
              color: theme.colors.text,
              fontFamily: theme.fonts.bold,
            }}
          >
            {name}
          </ThemedText>
        </View>

        {/* Account options */}
        <View
          style={{
            flexDirection: "column",
            backgroundColor: theme.colors.background,
            gap: 2,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 3.5,
            elevation: 5,
            width: "100%",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.lightBrown,
              padding: 15,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                router.push("/settings/adminFolder/adminEditProfile")
              }
            >
              <ThemedText
                style={{
                  fontSize: theme.sizes.h3,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bold,
                }}
              >
                Edit Profile
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.lightBrown,
              padding: 15,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                router.push("/settings/adminFolder/adminUpdatePassword")
              }
            >
              <ThemedText
                style={{
                  fontSize: theme.sizes.h3,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bold,
                }}
              >
                Update Password
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Admin-only options */}
        <View
          style={{
            flexDirection: "column",
            backgroundColor: theme.colors.background,
            gap: 2,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 3.5,
            elevation: 5,
            width: "100%",
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.lightBrown,
              padding: 15,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
          >
            <TouchableOpacity onPress={handleLogout}>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h3,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bold,
                }}
              >
                Log Out
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

export default AdminSettings;
