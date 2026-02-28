import { ThemedText, ThemedView } from "../../components";


export default function HomeScreen() {
  const name = "Fiona"; //TO DO: be able to get user's name from UserContext (or some other way)
  
  return (
    <ThemedView
      gradient={false}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ThemedText>Home Screen</ThemedText>
    </ThemedView>
  );
}
