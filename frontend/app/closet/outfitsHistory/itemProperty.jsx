import { View, StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams } from "expo-router"; // use to get id of outfit card click to get data from DB // need to rework there is mistake 

export default function ItemProperty() {
  const router = useRouter();

  const { id } = useLocalSearchParams();
  console.log("Clicked Outfit ID:", id);
  // TODO: Fetch data of the outfit my the id/name whatever we decide 
  return (
    <ThemedView style={{ flex: 1 }}>

      <View style={styles.image} />

      <View style={styles.info}>
        <ThemedText style={styles.title}>OUTFIT NAME</ThemedText>

        <ThemedText style={styles.label}>Description:</ThemedText>
        <ThemedText>lorem ipsum your figma</ThemedText>

        <ThemedText style={styles.label}>Tags:</ThemedText>

        <View style={styles.tags}>
          <View style={styles.tag}><ThemedText>tag</ThemedText></View>
          <View style={styles.tag}><ThemedText>tag</ThemedText></View>
          <View style={styles.tag}><ThemedText>tag</ThemedText></View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.btn}>
            <ThemedText>View Items</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn}>
            <ThemedText>Insights</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 250,
    margin: 20,
    borderRadius: 14,
    backgroundColor: "#d6c6b8",
  },

  info: {
    paddingHorizontal: 20,
  },

  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },

  label: {
    marginTop: 10,
    fontWeight: "bold",
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },

  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#e2d7cd",
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  btn: {
    backgroundColor: "#e2d7cd",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});