import { ThemedText, ThemedView } from "../../components";


export default function HomeScreen() {
  return (
    <ThemedView
      gradient={true}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ThemedText>Home Screen</ThemedText>
    </ThemedView>
  );
}
