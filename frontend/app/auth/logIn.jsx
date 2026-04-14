import { use, useState } from "react";
import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { apiClient, describeApiError } from "../../scripts/apiClient";
import Toast from 'react-native-toast-message';
import { useSurvey } from "context/SurveyContext";

function PasswordRules({ password }) {
  const rules = [
    { label: "At least 6 characters", pass: password.length >= 6 },
    { label: "One special character (@, #, $, &)", pass: /[@#$&]/.test(password) },
    { label: "One number", pass: /[0-9]/.test(password) },
  ];
  return (
    <View style={{ backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 1, borderColor: "#ddd", padding: 10, marginBottom: 12 }}>
      {rules.map((rule, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 3 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: rule.pass ? "#43a047" : "#e53935" }} />
          <Text style={{ fontSize: 13, color: rule.pass ? "#2e7d32" : "#c62828" }}>{rule.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Login() {
  const theme = useTheme();
  const router = useRouter();

  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const { resetAnswers } = useSurvey();

  const [showReset, setShowReset] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!resetUsername || !newPassword) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in all fields.' });
      return;
    }

    const rules = [ newPassword.length >= 6,
      /[@#$&]/.test(newPassword),
      /[0-9]/.test(newPassword),
    ];
    if (!rules.every(Boolean)) {
      Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Password must meet all requirements.' });
      return;
    }
    setResetLoading(true);
    try {
      // get userId from username 
      const userRes = await apiClient.get(`/api/users/by-username?username=${resetUsername}`);
      const { userId, firstName, email, role } = userRes.data;

      // update password with PUT endpoint
      await apiClient.put(`/api/users/${userId}`, {
        userId, firstName, email, role,
        username: resetUsername,
        password: newPassword,
      });

      Toast.show({ type: 'success', text1: 'Password Reset', text2: 'Your password has been updated.' });
      setShowReset(false);
      setResetUsername("");
      setNewPassword("");
    } catch (error) {
      const details = describeApiError(error);
      const status = details.status;

      console.error("Reset password failed:", details);

      Toast.show({ type: 'error',
        text1: 'Reset Failed',
        text2: status === 404 ? 'Username not found.' : details.message,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter both username and password.',
      });
      return;
    }
    let loginData;

    try {
      console.log("Sending login request...");
      const response = await apiClient.post("/api/users/login", {
        username,
        password,
      });

      loginData = response.data;
      console.log("Login successful:", loginData);
    } catch (error) {
      const details = describeApiError(error);
      const status = details.status;

      console.error("Login request failed:", details);

      const messages = {
        401: 'Invalid username or password.',
        500: details.message || 'Server error. Please try again later.',
      };

      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: messages[status] || details.message || 'Something went wrong.',
      });
      return;
    }

    let hasPreferences = false;
    try {
      const prefResponse = await apiClient.get(`/api/preferences/${loginData.userId}`);
      hasPreferences = Boolean(prefResponse?.data);
    } catch (error) {
      const details = describeApiError(error);

      if (details.status !== 404) {
        console.error("Preferences check failed after login:", details);
      }

      hasPreferences = false;
    }

    try {
      resetAnswers();
      await AsyncStorage.setItem("username", loginData.username);
      await AsyncStorage.setItem("userId", String(loginData.userId));

      try {
        const userResponse = await apiClient.get(`/api/users/${loginData.userId}`);
        await AsyncStorage.setItem("profileImageUrl", userResponse?.data?.profileImageUrl || "");
      } catch (error) {
        const details = describeApiError(error);
        console.error("Failed to hydrate profile image after login:", details);
      }

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: 'You have successfully logged in.',
      });

      if (hasPreferences) {
        router.replace("/(tabs)");
      } else {
        router.replace("/screens/survey/preferences1");
      }
    } catch (error) {
      console.error("Post-login client step failed:", error);
      Toast.show({
        type: 'error',
        text1: 'Login Partially Completed',
        text2: 'Signed in, but app setup failed. Please retry.',
      });
    }
  }

  return (
    <ThemedView gradient style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: "center",  alignItems: "center",  padding: 16, }}  behavior={Platform.OS === "ios" ? "padding" : "height"} >
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

        <ThemedText style={{ textAlign: "center", marginTop: 20, fontFamily: theme.fonts.light, }} >
          Forgot Password? {" "}
          <TouchableOpacity onPress={() => setShowReset(true)}>
            <ThemedText style={{fontSize: 13, fontFamily: theme.fonts.semiBold, textDecorationLine: "underline", }} >
              RESET HERE
            </ThemedText>
          </TouchableOpacity>
        </ThemedText>

        {/* Pop appears user will enter password here*/}
        {showReset && (
          <View style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 15,
            justifyContent: "center", alignItems: "center", padding: 20, zIndex: 10,
          }}>
            <View style={{ backgroundColor: "#E3D5CA", borderRadius: 15, padding: 20, width: "100%" }}>
              <ThemedText style={{ fontSize: 18, fontWeight: "bold", marginBottom: 14 }}>Reset Password</ThemedText>

              <TextInput
                placeholder="Username"
                placeholderTextColor={theme.colors.lightText}
                value={resetUsername}
                onChangeText={setResetUsername}
                style={[styles.input, { color: theme.colors.text }]}
                autoCapitalize="none"
              />

              <TextInput
                placeholder="New Password"
                placeholderTextColor={theme.colors.lightText}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={[styles.input, { color: theme.colors.text, marginBottom: 8 }]}
                autoCapitalize="none"
              />

              {newPassword.length > 0 && <PasswordRules password={newPassword} />}

              <TouchableOpacity
                onPress={handleResetPassword}
                disabled={resetLoading}
                style={[styles.button, { backgroundColor: theme.colors.card, marginBottom: 8 }]}
              >
                <ThemedText style={{ fontSize: 16, fontWeight: "bold" }}>
                  {resetLoading ? "Updating..." : "Update Password"}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setShowReset(false); setResetUsername(""); setNewPassword(""); }}>
                <ThemedText style={{ textAlign: "center", opacity: 0.6, marginTop: 4 }}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
