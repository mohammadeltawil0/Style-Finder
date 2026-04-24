import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";
import EditItemsModal from "../edit-items-modal";
import Feather from "@expo/vector-icons/Feather";

// Helper to format backend Enums (e.g. "FULL_BODY" -> "Full Body", "PARTY_OR_NIGHT_OUT" -> "Party / Night Out")
// --- FORMATTING HELPER ---
const formatTagEnum = (str) => {
  if (!str) return "";
  let cleanStr = str.replace(/_OR_/g, " / ").replace(/_/g, " ");
  return cleanStr.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const formatDescriptionEnum = (str) => {
  if (!str) return "";
  let cleanStr = str.replace(/_OR_/g, " / ").replace(/_/g, " ");
  return cleanStr.toLowerCase();
};


// Material mapping to match the frontend selection options
const materialMap = {
  1: "Cotton",
  2: "Linen/Hemp",
  3: "Wool/Fleece",
  4: "Silk/Satin",
  5: "Leather/Faux Leather",
  6: "Synthetics",
  7: "Other",
};

const itemTypeOrder = {
  OVER: 1,
  OUTERWEAR: 1,
  FULL_BODY: 2,
  TOP: 3,
  BOTTOM: 4,
};

export default function ItemProperty() {
  const router = useRouter();
  const theme = useTheme();
  const { id, outfitId, isOutfit, itemIndex } = useLocalSearchParams();
  const isOutfitMode = isOutfit === "true";

  const [item, setItem] = useState(null);
  const [items, setItems] = useState([]); // For outfit mode
  const [isLoading, setIsLoading] = useState(true);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // State to control the Edit Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Fetch the item(s) data from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (isOutfitMode && outfitId) {
          // Fetch all items in the outfit
          const response = await apiClient.get(`/api/outfits/${outfitId}`);
          if (response.status === 200) {
            const outfit = response.data;
            const itemIds =
              outfit.itemIds ||
              (outfit.outfitItems
                ? outfit.outfitItems.map((oi) => oi.item.itemId)
                : []);

            // Fetch details for each item
            const itemPromises = itemIds.map((itemId) =>
              apiClient.get(`/api/items/${itemId}`),
            );
            const results = await Promise.allSettled(itemPromises);
            const fetchedItems = results
              .filter((result) => result.status === "fulfilled")
              .map((result) => result.value.data);
            fetchedItems.sort(
              (a, b) =>
                (itemTypeOrder[a.type] || 99) - (itemTypeOrder[b.type] || 99),
            );
            setItems(fetchedItems);

            const parsedIndex = Number(itemIndex);
            if (Number.isInteger(parsedIndex) && parsedIndex >= 0) {
              const safeIndex = Math.min(parsedIndex, fetchedItems.length - 1);
              setCurrentItemIndex(safeIndex >= 0 ? safeIndex : 0);
            } else {
              setCurrentItemIndex(0);
            }
          }
        } else if (id) {
          // Single item mode
          const response = await apiClient.get(`/api/items/${id}`);
          if (response.status === 200) {
            setItem(response.data);
          }
        }
      } catch (error) {
        console.error(
          "Failed to fetch item details:",
          error?.response?.data || error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id || (isOutfitMode && outfitId)) {
      fetchData();
    }
  }, [id, outfitId, isOutfitMode, isEditModalVisible, itemIndex]);

  const currentItem = isOutfitMode ? items[currentItemIndex] || null : item;

  if (isLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={theme.colors.text} />
        <ThemedText style={{ marginTop: 10 }}>
          Loading Item Details...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!currentItem || (isOutfitMode && items.length === 0)) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Item not found.</ThemedText>
        <TouchableOpacity
          style={[styles.btn, { marginTop: 20 }]}
          onPress={() => router.back()}
        >
          <ThemedText>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const isValidUri = item?.imageUrl && typeof item.imageUrl === 'string' && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('file') || item.imageUrl.startsWith('data:'));

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={true}>
        <ThemedView>
          {/* Outfit Navigation Header */}
          {isOutfitMode && items.length > 1 && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 12,
                backgroundColor: theme.colors.card,
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  setCurrentItemIndex(Math.max(0, currentItemIndex - 1))
                }
                disabled={currentItemIndex === 0}
              >
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={currentItemIndex === 0 ? "#ccc" : theme.colors.text}
                />
              </TouchableOpacity>
              <ThemedText style={{ fontWeight: "bold" }}>
                Item {currentItemIndex + 1} of {items.length}
              </ThemedText>
              <TouchableOpacity
                onPress={() =>
                  setCurrentItemIndex(
                    Math.min(items.length - 1, currentItemIndex + 1),
                  )
                }
                disabled={currentItemIndex === items.length - 1}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={
                    currentItemIndex === items.length - 1
                      ? "#ccc"
                      : theme.colors.text
                  }
                />
              </TouchableOpacity>
            </View>
          )}

          {currentItem?.imageUrl ? (
            <Image
              source={{ uri: currentItem.imageUrl }}
              style={styles.imagePlaceholder}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { justifyContent: "center", alignItems: "center" }]}>
                <Feather name="image" size={60} color={theme.colors.text} />
            </View>
          )}

          <View style={styles.info}>
            <ThemedText style={styles.title}>
              {formatTagEnum(currentItem.type)}
            </ThemedText>

            <ThemedText style={styles.label}>Description:</ThemedText>
            <ThemedText style={{ marginTop: 4, flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
              A{' '}
              <View style={{ height: 20, width: 20, borderRadius: 10, backgroundColor: currentItem.color ? currentItem.color.toLowerCase() : "#ccc", marginHorizontal: 6, display: "inline-block" }} />
              {' '} {formatDescriptionEnum(currentItem.fit)} fit {formatDescriptionEnum(currentItem.type).toLowerCase()} with a {formatDescriptionEnum(currentItem.pattern)} pattern, perfect for {formatDescriptionEnum(currentItem.formality).toLowerCase()} occasions.
            </ThemedText>

            <ThemedText style={styles.label}>Tags:</ThemedText>
            <View style={styles.tags}>
              {currentItem.color && (
                <View style={styles.tag}>
                  <ThemedText>{formatTagEnum(currentItem.color)}</ThemedText>
                </View>
              )}
              {currentItem.pattern && (
                <View style={styles.tag}>
                  <ThemedText>{formatTagEnum(currentItem.pattern)}</ThemedText>
                </View>
              )}
              {currentItem.formality && (
                <View style={styles.tag}>
                  <ThemedText>{formatTagEnum(currentItem.formality)}</ThemedText>
                </View>
              )}
              {currentItem.seasonWear && (
                <View style={styles.tag}>
                  <ThemedText>{formatTagEnum(currentItem.seasonWear)}</ThemedText>
                </View>
              )}
              {currentItem.fit && (
                <View style={styles.tag}>
                  <ThemedText>{formatTagEnum(currentItem.fit)} Fit</ThemedText>
                </View>
              )}
              {currentItem.material && materialMap[currentItem.material] && (
                <View style={styles.tag}>
                  <ThemedText>{materialMap[currentItem.material]}</ThemedText>
                </View>
              )}
              {currentItem.length && (
                <View style={styles.tag}>
                  <ThemedText>{formatTagEnum(currentItem.length)}</ThemedText>
                </View>
              )}
            </View>

            <View style={styles.buttons}>
              {isOutfitMode ? (
                <TouchableOpacity
                  style={[styles.btn, styles.fullWidthBtn]}
                  onPress={() =>
                    router.push({
                      pathname: "/closet/item-details-modal",
                      params: {
                        tab: "items",
                        itemId: currentItem.itemId,
                      },
                    })
                  }
                >
                  <ThemedText>View Item</ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => setIsEditModalVisible(true)}
                >
                  <ThemedText>Edit Item</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ThemedView>
      </ScrollView>
      {!isOutfitMode && isEditModalVisible && (
        <EditItemsModal setModalVisible={setIsEditModalVisible} itemId={id} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: {
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
    fontSize: 22,
    marginBottom: 10,
    fontFamily: "bold",
  },
  label: {
    marginTop: 15,
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: "bold",
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
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
    marginTop: 30,
  },
  btn: {
    backgroundColor: "#e2d7cd",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    flex: 0.48,
  },
  fullWidthBtn: {
    flex: 1,
  },
});