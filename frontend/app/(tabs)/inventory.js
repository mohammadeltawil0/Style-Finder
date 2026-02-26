import { ThemedText, ThemedView } from "../../components";

export default function InventoryScreen() {
  return (
    <ThemedView
      gradient={false}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ThemedText>Inventory Screen</ThemedText>
    </ThemedView>
  );
}
