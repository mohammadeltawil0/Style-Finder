import { useCallback, useState, useEffect } from "react";
import Feather from "@expo/vector-icons/Feather";
import {
  Pressable,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
  Share,
  Modal,
} from "react-native";
import {
  ClosetToggle,
  Items,
  SearchBar,
  ThemedText,
  ThemedView,
} from "../../components";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

import EditItemsModal from "../closet/edit-items-modal";
import OutfitDetailsModal from "../closet/outfit-details-modal";
import { apiClient } from "../../scripts/apiClient";

export default function ClosetScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // --- UI States ---
  const [isItems, setIsItems] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeSearchText, setActiveSearchText] = useState("");
  const [category, setCategory] = useState("all");
  const [editItemsModalVisible, setEditItemsModalVisible] = useState(false);
  const [mode, setMode] = useState("regular");
  const [userId, setUserId] = useState(null);
  const [currItemId, setCurrItemId] = useState(null);

  // --- Database States (Outfits & Trips) ---
  const [dbOutfits, setDbOutfits] = useState([]);
  const [dbTrips, setDbTrips] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // --- Modal States ---
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isOutfitModalVisible, setIsOutfitModalVisible] = useState(false);

  // Safe Deletion States (From Version A)
  const [isDeleteOutfitModalVisible, setIsDeleteOutfitModalVisible] = useState(false);
  const [pendingDeleteOutfitId, setPendingDeleteOutfitId] = useState(null);
  const [isDeletingOutfit, setIsDeletingOutfit] = useState(false);

  // --- React Query for Items (From Version A) ---
  const fetchItems = async () => {
    if (!userId) return [];
    const response = await apiClient.get(`/api/items/user/${userId}`);
    return response.data;
  };

  const {
    data: items = [],
    isLoading: isItemsLoading,
    isError: isItemsError,
    error: itemsError,
    refetch,
  } = useQuery({
    queryKey: ["items", userId],
    queryFn: fetchItems,
    enabled: !!userId,
  });

  // --- Initial Data Load ---
  useEffect(() => {
    const loadUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      const parsedUserId = Number(storedUserId);
      if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
        setUserId(parsedUserId);
      }
    };
    loadUserId();
  }, []);

  const fetchUserOutfits = async (uid) => {
    try {
      const response = await apiClient.get(`/api/outfits/user/${uid}`);
      setDbOutfits(response.data);
    } catch (error) {
      console.error("Failed to fetch outfits:", error);
    }
  };

  const fetchUserTrips = async (uid) => {
    try {
      const response = await apiClient.get(`/api/trips/user/${uid}`);
      setDbTrips(response.data);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  useFocusEffect(
      useCallback(() => {
        const loadTabStateAndData = async () => {
          setIsDataLoading(true);
          try {
            const parsedId = userId || Number(await AsyncStorage.getItem("userId"));

            if (params.tab === "outfits") {
              setIsItems(false);
            } else if (params.tab === "items") {
              setIsItems(true);
            } else {
              const savedTab = await AsyncStorage.getItem("closetTab");
              setIsItems(savedTab !== "outfits");
            }

            if (parsedId) {
              await Promise.all([
                refetch(),
                fetchUserOutfits(parsedId),
                fetchUserTrips(parsedId),
              ]);
            }
          } catch (e) {
            console.error("Error loading closet state:", e);
          } finally {
            setIsDataLoading(false);
          }
        };

        loadTabStateAndData();
      }, [params.tab, refetch, userId])
  );

  // --- Interaction Handlers ---
  const handleToggleItems = async (value) => {
    setIsItems(value);
    await AsyncStorage.setItem("closetTab", value ? "items" : "outfits");
  };

  const handleSearchSubmit = () => setActiveSearchText(searchText);

  const getOutfitCoverImage = (outfit) => {
    if (outfit.coverImageUrl) return outfit.coverImageUrl;
    if (outfit.items && outfit.items.length > 0) {
      const topOrFull = outfit.items.find(
          (i) => i.type === "TOP" || i.type === "FULL_BODY"
      );
      if (topOrFull && topOrFull.imageUrl) return topOrFull.imageUrl;
      return outfit.items.imageUrl;
    }
    return null;
  };

  // Safe Deletion Logic (From Version A)
  const requestDeleteOutfit = (outfitId) => {
    setPendingDeleteOutfitId(outfitId);
    setIsDeleteOutfitModalVisible(true);
    setIsOutfitModalVisible(false);
  };

  const confirmDeleteOutfit = async () => {
    if (!pendingDeleteOutfitId) return;
    try {
      setIsDeletingOutfit(true);
      await apiClient.delete(`/api/outfits/${pendingDeleteOutfitId}`);
      setDbOutfits((prev) =>
          prev.filter((o) => o.outfitId !== pendingDeleteOutfitId && o.id !== pendingDeleteOutfitId)
      );
      setIsDeleteOutfitModalVisible(false);
      setPendingDeleteOutfitId(null);
    } catch (error) {
      console.error("Failed to delete outfit:", error);
    } finally {
      setIsDeletingOutfit(false);
    }
  };

  const handleShareOutfit = async (outfit) => {
    try {
      await Share.share({
        message: `Check out my outfit on Style Finder! It has ${outfit.itemIds?.length || 0} items.`,
      });
    } catch (error) {
      console.error("Error sharing outfit:", error.message);
    }
  };

  const formatItemType = (typeStr) => {
    if (!typeStr) return "";
    let clean = typeStr.replace(/_OR_/g, "/").replace(/_/g, " ");
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  };

  // --- Filtering ---
  const filteredItems = items.filter((item) => {
    const matchesSearch =
        activeSearchText === "" ||
        item.color?.toLowerCase().includes(activeSearchText.toLowerCase()) ||
        item.type?.toLowerCase().includes(activeSearchText.toLowerCase());

    const matchesCategory =
        category === "all" ||
        (category === "tops" && item.type === "TOP") ||
        (category === "bottoms" && item.type === "BOTTOM") ||
        (category === "dresses" && item.type === "FULL_BODY") ||
        (category === "outerwear" && (item.type === "OUTERWEAR" || item.type === "OVER"));

    return matchesSearch && matchesCategory;
  });

  return (
      <ThemedView gradient={false} style={{ flex: 1, alignItems: "center" }}>
        {!editItemsModalVisible && (
            <ClosetToggle isItems={isItems} toggleItems={handleToggleItems} />
        )}

        <View style={{ flex: 1, width: "100%", alignItems: "center" }}>
          {editItemsModalVisible ? (
              <EditItemsModal setModalVisible={setEditItemsModalVisible} itemId={currItemId} />
          ) : (
              <View style={{ width: "100%", flex: 1 }}>
                {/* Search Bar */}
                {isItems && (
                    <SearchBar
                        value={searchText}
                        onChangeText={(text) => {
                          setSearchText(text);
                          if (text === "") setActiveSearchText("");
                        }}
                        onSubmit={handleSearchSubmit}
                    />
                )}

                {isItems ? (
                    <>
                      {/* Horizontal Category Scroll (From Version B) */}
                      <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 15, padding: 15, paddingBottom: 20 }}
                          style={{ flexGrow: 0 }}
                      >
                        {["all", "tops", "bottoms", "dresses", "outerwear"].map(cat => (
                            <Pressable
                                key={cat}
                                style={{
                                  backgroundColor: category === cat ? theme.colors.tabIconSelected : theme.colors.lightBrown,
                                  borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, height: 40
                                }}
                                onPress={() => setCategory(cat)}
                            >
                              <ThemedText style={{ color: theme.colors.text }}>
                                {cat === "all" ? "All" : cat === "dresses" ? "Dresses/Full Body" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </ThemedText>
                            </Pressable>
                        ))}
                      </ScrollView>

                      {/* React Query Status States (From Version A) */}
                      {isItemsLoading ? (
                          <View style={styles.centerState}>
                            <ActivityIndicator size="large" color={theme.colors.tabIconSelected} />
                            <ThemedText style={{ marginTop: 10 }}>Loading your items...</ThemedText>
                          </View>
                      ) : isItemsError ? (
                          <View style={styles.centerState}>
                            <ThemedText style={{ textAlign: "center" }}>
                              {itemsError?.message || "Could not load items. Please try again."}
                            </ThemedText>
                            <Pressable onPress={() => refetch()} style={styles.retryButton}>
                              <ThemedText>Retry</ThemedText>
                            </Pressable>
                          </View>
                      ) : filteredItems.length === 0 ? (
                          <ThemedText style={{ textAlign: "center", marginTop: 20 }}>No items found.</ThemedText>
                      ) : (
                          <Items
                              items={filteredItems}
                              setCurrItemId={setCurrItemId}
                              currItemId={currItemId}
                              setEditItemsModalVisible={setEditItemsModalVisible}
                              editItemsModalVisible={editItemsModalVisible}
                          />
                      )}

                      <Pressable style={styles.fab} onPress={() => router.push("../closet/add-item")}>
                        <Ionicons name="add-sharp" size={40} color="black" />
                      </Pressable>
                    </>
                ) : (
                    <>
                      {/* Outfits / Trips Toggle */}
                      <View style={styles.outfitToggle}>
                        <TouchableOpacity style={[styles.toggleBtn, mode === "trip" && styles.activeToggle]} onPress={() => setMode("trip")}>
                          <ThemedText>Trips</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.toggleBtn, mode === "regular" && styles.activeToggle]} onPress={() => setMode("regular")}>
                          <ThemedText>Regular</ThemedText>
                        </TouchableOpacity>
                      </View>

                      {isDataLoading ? (
                          <View style={styles.centerState}>
                            <ActivityIndicator size="large" color={theme.colors.tabIconSelected} />
                          </View>
                      ) : (
                          <>
                            {/* REGULAR OUTFITS (Structure B + Logic A) */}
                            {mode === "regular" && (
                                <FlatList
                                    className="regularOutfit-list"
                                    data={dbOutfits}
                                    keyExtractor={(item, index) => item.outfitId?.toString() || index.toString()}
                                    numColumns="2"
                                    style={{ marginVertical: 15, paddingHorizontal: 30, width: "100%" }}
                                    columnWrapperStyle={{ justifyContent: "center", gap: 15 }}
                                    ListEmptyComponent={() => (
                                        <ThemedText style={{ textAlign: "center", marginTop: 20 }}>No saved outfits yet.</ThemedText>
                                    )}
                                    renderItem={({ item, index }) => {
                                      const displayImage = getOutfitCoverImage(item);
                                      return (
                                          <View style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.lightBrown, borderRadius: 10, marginBottom: 20, width: "48%" }}>
                                            <TouchableOpacity onPress={() => { setSelectedOutfit(item); setIsOutfitModalVisible(true); }}>
                                              {displayImage ? (
                                                  <Image
                                                      source={{ uri: displayImage }}
                                                      style={{ height: 175, width: "100%", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                                                      resizeMode="cover"
                                                  />
                                              ) : (
                                                  <View style={{ height: 175, backgroundColor: theme.colors.card, borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                                                    <ThemedText style={{ color: '#666', fontSize: 12 }}>Items: {item.itemIds?.length || 0}</ThemedText>
                                                  </View>
                                              )}
                                            </TouchableOpacity>
                                            <View style={{ backgroundColor: theme.colors.card, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderTopColor: theme.colors.border, flexDirection: "row", justifyContent: "space-between", padding: 10, alignItems: "center" }}>
                                              <ThemedText>Outfit {index + 1}</ThemedText>
                                              <Pressable onPress={() => { setSelectedOutfit(item); setIsOutfitModalVisible(true); }}>
                                                <Feather name="more-horizontal" size={20} color={theme.colors.text} />
                                              </Pressable>
                                            </View>
                                          </View>
                                      );
                                    }}
                                />
                            )}

                            {/* TRIPS OUTFITS (Structure B + Logic A Fix) */}
                            {mode === "trip" && (
                                <FlatList
                                    className="trip_Oufit_Details"
                                    data={dbTrips}
                                    keyExtractor={(trip) => trip.id?.toString()}
                                    style={{ marginVertical: 15, paddingHorizontal: 30, width: "100%" }}
                                    ListEmptyComponent={() => (
                                        <ThemedText style={{ textAlign: "center", marginTop: 20 }}>No trips logged yet.</ThemedText>
                                    )}
                                    renderItem={({ item }) => (
                                        <View className="TripOufit" style={styles.tripCard}>
                                          <TouchableOpacity onPress={() => router.push({ pathname: "/closet/outfitsHistory/tripOutfits", params: { id: item.id } })}>
                                            <View style={styles.tripHeader}>
                                              <View>
                                                <ThemedText style={{ fontWeight: "bold" }}>{item.name}</ThemedText>
                                                <ThemedText>{item.dates}</ThemedText>
                                              </View>
                                              <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.text} />
                                            </View>
                                          </TouchableOpacity>
                                          <View style={styles.previewRow}>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                              {item.outfits && item.outfits.map((outfit, index) => (
                                                  <View key={index} style={styles.previewBox} />
                                              ))}
                                            </ScrollView>
                                          </View>
                                        </View>
                                    )}
                                />
                            )}
                          </>
                      )}

                      {/* Outfit Details Modal */}
                      <OutfitDetailsModal
                          visible={isOutfitModalVisible}
                          outfit={selectedOutfit}
                          onClose={() => setIsOutfitModalVisible(false)}
                          onDelete={() => requestDeleteOutfit(selectedOutfit?.outfitId || selectedOutfit?.id)}
                          onShare={() => handleShareOutfit(selectedOutfit)}
                          theme={theme}
                      />

                      {/* Safe Deletion Modal (From Version A) */}
                      <Modal
                          visible={isDeleteOutfitModalVisible}
                          transparent={true}
                          animationType="fade"
                          onRequestClose={() => setIsDeleteOutfitModalVisible(false)}
                      >
                        <View style={styles.modalOverlay}>
                          <View style={[styles.confirmModalContent, { backgroundColor: theme.colors.background }]}>
                            <ThemedText style={styles.confirmTitle}>Delete Outfit</ThemedText>
                            <ThemedText style={styles.confirmText}>
                              Are you sure you want to delete this outfit? This cannot be undone.
                            </ThemedText>
                            <View style={styles.confirmActions}>
                              <TouchableOpacity
                                  style={[styles.confirmBtn, { backgroundColor: theme.colors.card }]}
                                  onPress={() => setIsDeleteOutfitModalVisible(false)}
                                  disabled={isDeletingOutfit}
                              >
                                <ThemedText>Cancel</ThemedText>
                              </TouchableOpacity>
                              <TouchableOpacity
                                  style={[styles.confirmBtn, { backgroundColor: "#ff4444" }]}
                                  onPress={confirmDeleteOutfit}
                                  disabled={isDeletingOutfit}
                              >
                                {isDeletingOutfit ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <ThemedText style={{ color: "#fff", fontWeight: "bold" }}>Delete</ThemedText>
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </Modal>
                    </>
                )}
              </View>
          )}
        </View>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  centerState: { flex: 1, justifyContent: "center", alignItems: "center" },
  retryButton: { marginTop: 15, padding: 10, backgroundColor: "#b49480", borderRadius: 8 },
  outfitToggle: { flexDirection: "row", margin: 15, backgroundColor: "#e2d7cd", borderRadius: 10, alignSelf: "stretch" },
  toggleBtn: { flex: 1, padding: 10, alignItems: "center" },
  activeToggle: { backgroundColor: "#b49480", borderRadius: 10 },
  tripCard: { backgroundColor: "#d6c6b8", borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 16 },
  tripHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  previewRow: { flexDirection: "row" },
  previewBox: { width: 70, height: 70, backgroundColor: "#eee", borderRadius: 8, marginRight: 10 },
  fab: { backgroundColor: "#b49480", borderRadius: 100, bottom: 30, padding: 5, position: "absolute", right: 30, zIndex: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  confirmModalContent: { width: "80%", borderRadius: 16, padding: 20, elevation: 5 },
  confirmTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  confirmText: { marginBottom: 16, lineHeight: 20, textAlign: "center" },
  confirmActions: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  confirmBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
});