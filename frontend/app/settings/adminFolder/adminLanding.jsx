import { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "../../../components";
import "../../../assets/images/custom-logo-2.png"; // Ensure the image is bundled with the app


export default function AdminLanding() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/settings/adminFolder/adminUsers");
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView gradient style={styles.container}>
      <View style={styles.logoCircle}>
        <Image source={require("../../../assets/images/custom-logo-2.png")} style={styles.logoImage} />
      </View>
      <Text style={styles.welcome}>WELCOME{"\n"}ADMIN!</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoCircle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "#D4B8A8",
    justifyContent: "center", alignItems: "center", marginBottom: 32,
  },
  logoImage: {
    width: 160, height: 160, borderRadius: 80,alignItems: "center", justifyContent: "center",
    backgroundColor: "#D4B8A8",
    justifyContent: "center", alignItems: "center", marginBottom: 32,
  },
  welcome: { fontSize: 32, fontWeight: "bold", textAlign: "center", letterSpacing: 1 },
});