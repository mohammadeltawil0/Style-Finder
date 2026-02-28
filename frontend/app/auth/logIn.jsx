import { TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText, ThemedView, GradientBackground } from "../../components";
import { useState } from "react";


//TO DO: connect with backend, add basic validation, and add router to navigate to (tabs)
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

//TO DO: implment handleLogin function

export default function Login(){
    const theme = useTheme();
    return(
        <ThemedView style={[StyleSheet.card, { backgroundColor: theme.colors.background}]}>
            <ThemedText style={[styles.title, {fontFamily: theme.fonts.bold, fontSize: theme.sizes.h1}]}> WELCOME BACK </ThemedText>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} placeholderTextColor="#666" style={[styles.input, {backgroundColor: theme.colors.background, color: theme.colors.text, fontfamily: theme.fonts.regular}]}/>
            <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#666" style={[styles.input, {backgroundColor: theme.colors.background, color: theme.colors.text, fontFamily: theme.fonts.regular}]}/>
            <View style={styles.row}>
                <ThemedText style={{fontFamily: theme.fonts.light }}>Forgot Password?</ThemedText>
                <View style={styles.rememberContainer}>
                    <View style={[styles.checkbox, {backgroundColor: theme.colors.background}]}/>
                    <ThemedText style={{marginLeft: 6, fontFamily: theme.fonts.light }}> Remember Me?</ThemedText>
                </View>
            </View>

            <TouchableOpacity style={[styles.button, {backgroundColor: theme.colors.background}]}> 
                <ThemedText style={{fontFamily: theme.fonts.semiBold}}>Sign In</ThemedText>
            </TouchableOpacity>

            <ThemedText style={[styles.singupText, {fontfamily: theme.fonts.light}]}>Don't have an account?{" "}
                <ThemedText style={{fontFamily: theme.fonts.semiBold, textDecorationLine: "underline"}}>SIGN UP</ThemedText>
            </ThemedText>

        </ThemedView>
    );
}
const styles = StyleSheet.create({
    card: {
        width: "85%",
        alignSelf: "center",
        marginTop: "40%",
        padding: 24,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shandowRadius: 10,
        elevation: 8,
    },
    title: {
        textAlign: "center",
        marginBottom: 20,
    },
    input: {
        padding: 14,
        borderRadius: 10,
        marginBottom: 16,
    },
    button: {
        padding: 16,
        borderRadius: 30,
        alignItems: "center",
        marginTop: 10,
    },
});
