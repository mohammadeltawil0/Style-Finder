import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { ThemedView } from "../../components";

export default function UserLandingPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [firstName, setFirstName] = useState("");
  const isFirstTime = params?.firstTime === "true";

  useEffect(() => {
    const loadFirstName = async () => {
      try {
        const storedWelcomeName = await AsyncStorage.getItem("welcomeName");
        const storedName = await AsyncStorage.getItem("name");
        const storedUsername = await AsyncStorage.getItem("username");
        setFirstName(
          storedWelcomeName || storedName || storedUsername || "User",
        );
      } catch (error) {
        setFirstName("User");
      }
    };

    loadFirstName();

    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ThemedView gradient style={styles.container}>
      <View style={styles.logoWrap}>
        <Image
          source={require("../../assets/images/custom-logo-2.png")}
          style={styles.logoImage}
        />
      </View>
      {isFirstTime ? (
        <Text
          style={styles.welcome}
        >{`Welcome to StyleFinder, ${firstName}`}</Text>
      ) : (
        <>
          <Text style={styles.welcome}>{`Welcome Back,`}</Text>
          <Text style={styles.welcome}>{firstName}</Text>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoWrap: {
    width: "50%",
    aspectRatio: 1,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoImage: {
    width: "80%",
    height: "100%",
    resizeMode: "cover",
  },
  welcome: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
});
