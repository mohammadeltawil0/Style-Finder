import { useState } from "react";
import {Alert, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet,} from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      const response = await fetch(
        "http://localhost:8080/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: username, password: password }),
        }
        //  "http://{computerIPAddress}:8080/api/users/login", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ username: username, password: password }),
        // }
      );


      const data = await response.json();
      console.log("Login response:", data);

      if (response.ok) {
        alert("Login worked");
        console.log("Login successful:", data);


        // Save user data
        await AsyncStorage.setItem("username", data.username);
        await AsyncStorage.setItem("userId", data.userId.toString());


        router.replace("/(tabs)");
      } else {
        alert("Login failed: " + data.message);
      }


    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login. Please try again.");


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