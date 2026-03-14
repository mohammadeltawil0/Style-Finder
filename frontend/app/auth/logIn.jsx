import { useState } from "react";
import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {View, TextInput,TouchableOpacity,
    KeyboardAvoidingView, Platform, StyleSheet} from "react-native";
import {apiClient} from "../../scripts/apiClient";

export default function Login() {
  const { colors, fonts } = useTheme();
  const router = useRouter();
  

  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");

   const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
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
           alert("Login worked");
           await AsyncStorage.setItem("username", data.username);
           await AsyncStorage.setItem("userId", data.userId.toString());
           router.replace("/");

       } catch (error) {
           console.error("Error during login:", error);

           // Axios safely extracts the backend's error message (e.g., "User not found!")
           const errorMessage = error.response?.data?.message
               || error.response?.data
               || "An error occurred during login. Please try again.";

           alert("Login failed: " + errorMessage);
       }
  };


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
            { backgroundColor: colors.lightBrown }
          ]}
        >
          <ThemedText
            style={{
              fontSize: 28,
              marginBottom: 20,
              fontFamily: fonts.bold,
            }}
          >
            Welcome Back
          </ThemedText>

          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setusername}
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleLogin}
            activeOpacity={0.7}
            style={[
              styles.button,
              { backgroundColor: colors.card }
            ]}
          >
            <ThemedText
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
              }}
            >
              Sign In
            </ThemedText>
          </TouchableOpacity>

          <ThemedText
            style={{
              textAlign: "center",
              marginTop: 20,
              fontFamily: fonts.light,
            }}
          >
            Don’t have an account?{"  "}
            <TouchableOpacity onPress={() => router.replace("/auth/register")}>
            <ThemedText
              style={{
                fontSize:13,
                fontFamily: fonts.semiBold,
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