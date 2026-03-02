import React, { useState, useEffect } from "react";
import { View, Text, TextInput,TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

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
 
  const [firstName, setName] = useState(""); 
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = () => {
    if(password !== confirmPassword){
      Alert.alert("Error", "Passwords do not match"); 
      return; 
    }

    // for debugging - remove later
    console.log(firstName)
    console.log(email)
    console.log(username)
    console.log(password)

    Alert.alert( "Confirm Sign Up",
    `First Name: ${firstName}
      Email: ${email}
      Username: ${username}
      Password: ${password}`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Confirm",
          onPress: () => { processSignUp();}
        }
      ]
    );
  };

  const processSignUp = () => {

    // TODO: Sign Up will be handle here (Backend + DB)
    Alert.alert("Success", "Signed Up Successfully!"); 

    
    // clear fields 
    setName("");
    setEmail("");
    setUserName("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <ThemedView
      gradient={true}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
    <KeyboardAvoidingView
      style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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

        {/* TODO: ASK FIONA WHY secureTextEntry DOESNOT WORK */}
        <TextInput
          placeholder = "Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleSignUp}
          activeOpacity={0.7}
          style={{
              backgroundColor: "#ffffff",
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