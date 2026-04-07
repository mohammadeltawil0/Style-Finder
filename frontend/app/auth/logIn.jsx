import { use, useState } from "react";
import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet, Alert
} from "react-native";
import { apiClient } from "../../scripts/apiClient";
import Toast from 'react-native-toast-message';
import { useSurvey } from "context/SurveyContext";

export default function Login() {
  const theme = useTheme();
  const router = useRouter();

  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const { resetAnswers } = useSurvey();

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter both username and password.',
      });
      return;
    }
    try {
      console.log("Sending login request...");
      const response = await apiClient.post("/api/users/login", {
        username: username,
        password: password,
      });

      const data = response.data;
      console.log("Login successful:", data);

      let hasPreferences = false;

      // Check if user has preferences to determine where to navigate after login
      try {
        const prefResponse = await apiClient.get(`/api/preferences/${data.userId}`);
        if (prefResponse.data) {
          hasPreferences = true;
        }
      } catch (err) {
        if (err.response?.status === 404) {
          console.log("No preferences found. Redirected to survey");
          hasPreferences = false;
        } else {
          throw err;
        }
      }

      resetAnswers();
      await AsyncStorage.setItem("username", data.username);  // ← moved here
      await AsyncStorage.setItem("userId", data.userId.toString()); // ← moved here

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'You have successfully logged in.',
      });

      if (hasPreferences) {
        router.replace("/(tabs)"); //for returniing user
      } else {
        router.replace("/screens/survey/preferences1"); //new user
      }
    } catch (error) {
      console.error("Error during login:", error);

      const status = error.response?.status;

      const messages = {
        401: 'Invalid username or password.',
        500: 'Server error. Please try again later.', //TO DO: idk if this implemented in backend
      };

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: messages[status] || 'Something went wrong.',
      });
    }
  }

  return (
    <ThemedView gradient style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.lightBrown }
          ]}
        >
          <ThemedText
            style={{
              fontSize: 28,
              marginBottom: 20,
              fontFamily: theme.fonts.bold,
            }}
          >
            Welcome Back
          </ThemedText>

          <TextInput
            placeholder="Username"
            placeholderTextColor={theme.colors.lightText}
            value={username}
            onChangeText={setusername}
            style={[styles.input, { color: theme.colors.text }]}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor={theme.colors.lightText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={[styles.input, { color: theme.colors.text }]}
          />

          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.7}
            style={[
              styles.button,
              { backgroundColor: theme.colors.card }
            ]}
          >
            <ThemedText
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: theme.colors.text,
              }}
            >
              Sign In
            </ThemedText>
          </TouchableOpacity>

          <ThemedText
            style={{
              textAlign: "center",
              marginTop: 20,
              fontFamily: theme.fonts.light,
            }}
          >
            Don’t have an account?{"  "}
            <TouchableOpacity onPress={() => router.replace("/auth/register")}>
              <ThemedText
                style={{
                  fontSize: 13,
                  fontFamily: theme.fonts.semiBold,
                  textDecorationLine: "underline",
                }}
              >
                SIGN UP
              </ThemedText>
            </TouchableOpacity>
          </ThemedText>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 25,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
  },
  button: {
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 12,
  },
});