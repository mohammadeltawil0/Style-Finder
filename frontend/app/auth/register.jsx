import React, { useState, useEffect, use } from "react";
import { ThemedText, ThemedView } from "../../components";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet
} from "react-native";
import { apiClient } from "../../scripts/apiClient";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-toast-message';

function LiveTyping({ text }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    const speed = deleting ? 80 : 120;

    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplayed(text.slice(0, index + 1));
        setIndex(index + 1);

        if (index + 1 === text.length) {
          setDeleting(true);
        }
      } else {
        setDisplayed(text.slice(0, index - 1));
        setIndex(index - 1);

        if (index - 1 === 0) {
          setDeleting(false);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [index, deleting, text]);

  return (
    <Text style={{ fontSize: 26, fontWeight: "bold", color: theme.colors.text }}>
      {displayed}
      <Text style={{ opacity: 0.8 }}>|</Text>
    </Text>
  );
}

function PasswordRules({ password }) {
  const rules = [
    { label: "At least 6 characters", pass: password.length >= 6 },
    { label: "One special character (@, #, $, &)", pass: /[@#$&]/.test(password) },
    { label: "One number", pass: /[0-9]/.test(password) },
  ];
  
  return (
    <View style={{ backgroundColor: "#ffffff", borderRadius: 10, borderWidth: 1, borderColor: "#ddd", padding: 10, marginBottom: 15 }}>
      {rules.map((rule, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 3 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: rule.pass ? "#43a047" : "#e53935" }} />
          <Text style={{ fontSize: 13, color: rule.pass ? "#2e7d32" : "#c62828" }}>{rule.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Register() {
  const router = useRouter(); // updated to take user to the survey 
  const { colors } = useTheme();
  const [firstName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const theme = useTheme();

  // validate correct email format 
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  
  // if returns true, we want to fail the sign up process and show error toast that username is taken
  const duplicateUsernameCheck = async (username) => {
      console.log(">>> checking username:", JSON.stringify(username)); // shows if it's empty/null

  try {
    await apiClient.get(`/api/users/check-username?username=${username}`);
    return false; // 200 = username is available
  } catch (error) {
    if (error.response?.status === 409) {
      return true; // 409 = username is taken
    }
    console.error("Error checking username:", error);
    return false;
  }
};

  const handleSignUp = async () => {
    if (!firstName || !email || !username || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill in all fields.' });
      return;
    }

    if (!isValidEmail(email)) {
      Toast.show({ type: 'error', text1: 'Invalid Email', text2: 'Please enter a valid email address.' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match.' });
      return;
    }

    const passwordRules = [
    password.length >= 6,
      /[@#$&]/.test(password),
      /[0-9]/.test(password),
    ];

    if (!passwordRules.every(Boolean)) {
      Toast.show({ type: 'error', text1: 'Weak Password', text2: 'Password must meet all requirements.' });
      return;
    }

    const isDuplicate = await duplicateUsernameCheck(username);
    if (isDuplicate) {
      Toast.show({ type: 'error', text1: 'Username Taken', text2: 'Please choose a different username.' });
      return;
    }

    processSignUp();
  };


  const processSignUp = async () => {
    try {
      const response = await apiClient.post("/api/users/register", {
        firstName,
        email,
        username,
        password,
        role: "USER",
        createdAt: new Date().toISOString(),
      });

      Toast.show({ type: 'success', text1: 'Welcome!', text2: 'Account created successfully.' });

      await AsyncStorage.multiSet([
        ["userId", String(response.data.userId)],
        ["username", response.data.username || username],
        ["profileImageUrl", response.data.profileImageUrl || ""],
      ]);

      router.replace("/screens/survey/preferences1"); //reroute to survey

    } catch (error) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      // map each status code to a user-friendly message
      const messages = {
        400: serverMessage || 'Invalid data. Please check your inputs.',
        409: 'Username or email is already taken.',
        500: 'Server error. Please try again later.',
      };

      Toast.show({
        type: 'error',
        text1: 'Sign Up Failed',
        text2: messages[status] || 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <ThemedView gradient={true} style={{ flex: 1, alignItems: "center", justifyContent: "center" }} >
      <KeyboardAvoidingView style={{ flex: 1 , justifyContent: "center", alignItems: "center", padding: 16 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 , justifyContent: "center", alignItems: "center", padding: 16, }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <LiveTyping text="Let's get started!" />
          <ThemedText style={{ fontSize: 20, marginBottom: 40 }}> Sign-up To Plan For Outfits</ThemedText>

          <View style={styles.card} >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <Ionicons onPress={() => router.replace("/")} name="chevron-back" size={20} color={colors.text} />
              <ThemedText style={{ fontSize: 28, fontWeight: 'bold' }}> Create An Account </ThemedText>
            </View>
            <TextInput
              placeholder="First Name"
              placeholderTextColor={theme.colors.lightText}
              value={firstName}
              onChangeText={setName}
              style={[styles.input, { color: theme.colors.text }]}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={theme.colors.lightText}
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { color: theme.colors.text }]}
            />
            <TextInput
              placeholder="Username"
              placeholderTextColor={theme.colors.lightText}
              value={username}
              onChangeText={setUserName}
              style={[styles.input, { color: theme.colors.text }]}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={theme.colors.lightText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { color: theme.colors.text }]}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="none"
            />
            <PasswordRules password={password} />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor={theme.colors.lightText}
              value={confirmPassword}
              secureTextEntry
              onChangeText={setConfirmPassword}
              style={[styles.input, { color: theme.colors.text }]}
            />

            <TouchableOpacity
              onPress={handleSignUp}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.card,
                borderRadius: 12,
                alignItems: "center",
                marginTop: 10,
                paddingVertical: 10,
              }}
            >
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Helvetica' }}>
                Sign Up
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 25,
    backgroundColor: "#E3D5CA",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8
  },
  input: {
    backgroundColor: "#ffffff",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
  },
});