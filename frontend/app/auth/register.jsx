import React, { useState, useEffect } from "react";
import { ThemedText, ThemedView } from "../../components";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import {Alert, View, Text, TextInput, ScrollView,TouchableOpacity,
  KeyboardAvoidingView, Platform, StyleSheet} from "react-native";
import {apiClient} from "../../scripts/apiClient";



function LiveTyping({ text }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

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
    <Text style={{ fontSize: 26, fontWeight: "bold" }}>
      {displayed}
      <Text style={{ opacity: 0.8 }}>|</Text>
    </Text>
  );
}

export default function Register() {
  const router = useRouter(); // TODO: once sign up done should take to home page !!
  const { colors } = useTheme();
  const [firstName, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // validate correct email format 
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = () => {
    // check required fields
    if (!firstName || !email || !username || !password || !confirmPassword) {
      Alert.alert("Error", "All fields are required. You are missing one or more field ");
      return;
    }
    // check email format
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if(password !== confirmPassword){
      Alert.alert("Error", "Passwords do not match"); 
      return; 
    }

    // for debugging - remove later
    //TODO: Add backend logic 
    console.log(firstName)
    console.log(email)
    console.log(username)
    console.log(password)

    processSignUp();
    };


  const processSignUp = async () => {
    try {
      console.log("Sending signup request...");
      const response = await apiClient.post("/api/users/register", {
        firstName: firstName,
        email: email,
        username: username,
        password: password,
        role: "USER",
        createdAt: new Date().toISOString(),
      });
      console.log("Line after that...");
      console.log("Response:", response.data);

      // If we reach this line, the backend has accepted the signup request
      Alert.alert("Success", "Account Created Successfully!");
      router.replace("/auth/logIn");

    } catch (error) {
      console.error("Error during sign up:", error);

      const errorMessage = error.response?.data?.message
          || error.response?.data
          || "An error occurred during sign up. Please try again.";

      Alert.alert("Error", "Sign Up Failed: " + errorMessage);
    }
  };

  return (
    <ThemedView gradient={true} style={{ flex: 1, alignItems: "center", justifyContent: "center" }} >
    <KeyboardAvoidingView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }} behavior={Platform.OS === "ios" ? "padding" : "height"} >
    
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 16, }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <LiveTyping text="Let's get started!" />
      <ThemedText style={{fontSize: 20, marginBottom: 40}}> Sign-up To Plan For Outfits</ThemedText>
      
      <View style={styles.card} > 
        <ThemedText style={{ fontSize: 28, marginBottom: 20}}> Create An Account </ThemedText>
        <TextInput
          placeholder="First Name"
          value={firstName}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUserName}
          style={styles.input}
        />
        <TextInput
          placeholder = "Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="none"
        />
        <TextInput
          placeholder = "Confirm Password"
          value={confirmPassword}
          secureTextEntry
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
        
        <TouchableOpacity
          onPress={handleSignUp}
          activeOpacity={0.7}
          style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#ccc",
              alignItems: "center",
              marginTop: 10,
              paddingVertical: 10, 
          }}
        >
        <ThemedText style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Helvetica'}}>
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
  card: {width: "100%",
          maxWidth: 400,
          padding: 25,
          backgroundColor: "#E3D5CA",
          borderRadius: 15,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,},
  input: {
    backgroundColor: "#ffffff",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
  },
});