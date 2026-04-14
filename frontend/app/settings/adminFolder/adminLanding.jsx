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
    }, 1005000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemedView gradient style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={require("../../../assets/images/custom-logo-2.png")} style={styles.logoImage} />
      </View>
      <Text style={styles.welcome}>WELCOME{"\n"}ADMIN!</Text>
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
  welcome: { fontSize: 32, fontWeight: "bold", textAlign: "center", },
});