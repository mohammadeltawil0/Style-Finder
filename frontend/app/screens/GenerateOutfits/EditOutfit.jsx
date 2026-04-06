import { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { ThemedView, ThemedText } from "../../../components";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const placeholderImage = require("../../../assets/images/placeholder.png");

const ITEM_LABELS = {
  outerwear: "Outer Wear",
  top: "Top",
  bottom: "Bottom",
  fullbody: "Full Body",
  full_body: "Full Body",
  full_body: "Full Body",
  fullBody: "Full Body",
};

const normalizeType = (type) => {
  if (!type) return "";
  const normalized = type.toString().replace(/[^a-zA-Z]/g, "").toLowerCase();
  if (normalized.includes("outer")) return "outerwear";
  if (normalized.includes("bottom")) return "bottom";
  if (normalized.includes("full")) return "fullbody";
  if (normalized.includes("top")) return "top";
  return type;
};

const itemLabel = (type) => ITEM_LABELS[normalizeType(type)] || "Item";

const routeType = (type) => {
  const normalized = normalizeType(type);
  if (normalized === "top") return "TOP";
  if (normalized === "bottom") return "BOTTOM";
  if (normalized === "outerwear") return "OUTERWEAR";
  return "FULL_BODY";
};

export default function EditOutfit() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadOutfit = async () => {
      if (params.outfit) {
        try {
          const parsed = JSON.parse(params.outfit.toString());
          if (parsed?.items) {
            setItems(parsed.items);
            return;
          }
        } catch (error) {
          console.log("Invalid outfit param", error);
        }
      }

      const index = Number(params.index ?? -1);
      if (index >= 0) {
        const saved = await AsyncStorage.getItem("latestOutfitResult");
        if (saved) {
          const parsed = JSON.parse(saved);
          const outfit = Array.isArray(parsed?.outfits)
            ? parsed.outfits[index]
            : parsed[index];
          if (outfit?.items) {
            setItems(outfit.items);
          }
        }
      }
    };
    loadOutfit();
  }, [params]);

  const onItemPress = (item) => {
    router.push({
      pathname: "/screens/GenerateOutfits/ClosetItems",
      params: { type: routeType(item?.type) },
    });
  };

  const handleSave = () => {
    console.log("Outfit saved");
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedText style={styles.title}>Want to change a few things?</ThemedText>
        <ThemedText style={styles.subtitle}>
          Tap any item to replace it from your closet.
        </ThemedText>

        <View style={styles.tilesContainer}>
          {items.length === 0 && (
            <ThemedText style={styles.emptyText}>
              No outfit loaded yet. Open your generated outfit and try again.
            </ThemedText>
          )}

          {items.map((item, index) => {
            const typeKey = normalizeType(item.type);
            const imageSource = item.image_url
              ? { uri: item.image_url }
              : placeholderImage;
            const isFullBody = typeKey === "fullbody";

            return (
              <TouchableOpacity
                key={`${typeKey}-${index}`}
                style={[
                  styles.itemCard,
                  isFullBody && styles.fullBodyCard,
                ]}
                onPress={() => onItemPress(item)}
              >
                <Image source={imageSource} style={styles.itemImage} />
                <ThemedText style={styles.itemLabel}>
                  {itemLabel(item.type)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveText}>Save Outfit</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#555",
    width: "85%",
  },
  tilesContainer: {
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  itemCard: {
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#F1F2F6",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  fullBodyCard: {
    paddingVertical: 16,
  },
  itemImage: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    marginBottom: 12,
    resizeMode: "cover",
    backgroundColor: "#DDD",
  },
  itemLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#B5B7C0",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  saveText: {
    fontWeight: "bold",
    color: "#111",
    fontSize: 16,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 40,
  },
});
