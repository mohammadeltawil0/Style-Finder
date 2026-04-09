
import { ThemedView, ThemedText } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image } from "react-native";

const WelcomeScreen = () => {
    const theme = useTheme();
    const router = useRouter();
    const [username, setUsername] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadUsername = async () => {
            const storedUsername = await AsyncStorage.getItem("username");
            if (isMounted && storedUsername) {
                setUsername(storedUsername);
            }
        };

        loadUsername();

        const timeoutId = setTimeout(() => {
            router.replace("/(tabs)");
            
        }, 2000);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [router]);

    
    
    return (
        <ThemedView gradient style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 300, height: 300, marginBottom: 16 }}
                resizeMode="contain"
            />
            <ThemedText style={{ fontSize: theme.sizes.h1, fontWeight: "bold", color: theme.colors.text }}>
                Welcome to StyleFinder
            </ThemedText>
            <ThemedText style={{ fontSize: theme.sizes.h1, color: theme.colors.text, marginTop: 10 }}>
                {username}
            </ThemedText>
        </ThemedView>
    );
}

export default WelcomeScreen;