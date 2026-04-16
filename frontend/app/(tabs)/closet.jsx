import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ClosetToggle,
  Items,
  SearchBar,
  ThemedText,
  ThemedView,
} from "../../components";
import { apiClient } from "../../scripts/apiClient";
import EditItemsModal from "../closet/edit-items-modal";
import OutfitDetailsModal from "../closet/outfit-details-modal";
import OutfitCoverImage from "../closet/outfit-cover-image";

export default function ClosetScreen() {
  const [isItems, setIsItems] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeSearchText, setActiveSearchText] = useState("");
  const [category, setCategory] = useState("all");
  const [editItemsModalVisible, setEditItemsModalVisible] = useState(false);
  const [mode, setMode] = useState("regular");
  const [userId, setUserId] = useState(null);
  const [currItemId, setCurrItemId] = useState(null);

  const [dbOutfits, setDbOutfits] = useState([]);
  const [dbTrips, setDbTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isOutfitModalVisible, setIsOutfitModalVisible] = useState(false);

  const params = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const fetchItems = async () => {
    if (!Number.isInteger(userId) || userId <= 0) return [];
    const response = await apiClient.get(`/api/items/user/${userId}`);
    return [...response.data].sort((a, b) => {
      const aId = Number(a?.itemId ?? a?.id ?? 0);
      const bId = Number(b?.itemId ?? b?.id ?? 0);
      return bId - aId;
    });
  };

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

  const fetchUserOutfits = async (id) => {
    try {
      const response = await apiClient.get(`/api/outfits/user/${id}`);
      if (response.status === 200) {
        const formattedOutfits = response.data.map((outfit) => ({
          ...outfit,
          itemIds:
            outfit.itemIds ||
            (outfit.outfitItems
              ? outfit.outfitItems.map((oi) => oi.item.itemId)
              : []),
        }));

        setDbOutfits(formattedOutfits);
      }
    } catch (error) {
      console.error("Failed to fetch outfits:", error);
    }
  };

  const fetchUserTrips = async (id) => {
    try {
      const response = await apiClient.get(`/api/trips/user/${id}`);
      if (response.status === 200) {
        const formattedTrips = response.data.map((trip) => ({
          id: trip.tripId?.toString(),
          name: trip.tripLocation || "Trip",
          location: trip.tripLocation || "",
          dates:
            trip.startDate && trip.endDate
              ? `${trip.startDate} - ${trip.endDate}`
              : "",
          outfits: trip.tripOutfits || [],
        }));
        setDbTrips(formattedTrips);
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadTabStateAndData = async () => {
        try {
          setIsLoading(true);
          const userIdStr = await AsyncStorage.getItem("userId");
          const parsedId = userIdStr ? parseInt(userIdStr, 10) : null;

          if (params.tab === "outfits") {
            setIsItems(false);
            await AsyncStorage.setItem("closetTab", "outfits");
          } else if (params.tab === "items") {
            setIsItems(true);
            await AsyncStorage.setItem("closetTab", "items");
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
          setIsLoading(false);
        }
      };

      loadTabStateAndData();
    }, [params.tab, refetch]),
  );

  const handleToggleItems = async (value) => {
    setIsItems(value);
    await AsyncStorage.setItem("closetTab", value ? "items" : "outfits");
  };

  const handleSearchSubmit = () => setActiveSearchText(searchText);

  const handleDeleteOutfit = async (outfitId) => {
    try {
      await apiClient.delete(`/api/outfits/${outfitId}`);
      setDbOutfits((prev) =>
        prev.filter((o) => o.outfitId !== outfitId && o.id !== outfitId),
      );
      setIsOutfitModalVisible(false);
    } catch (error) {
      console.error("Failed to delete outfit:", error);
    }
  };

  const formatItemType = (type) => {
    if (!type) return "Item";
    const cleanStr = type.replace(/_/g, " ");
    return cleanStr.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  };

  const processedItems = items.map((item, index) => ({
    ...item,
    id: item.itemId,
    name: `${formatItemType(item.type)} (Item ${index + 1})`,
  }));

  const getOutfitCoverImages = (outfit) => {
    const urlsFromOutfitItems = (outfit?.outfitItems || [])
      .map((oi) => oi?.item?.imageUrl || oi?.item?.image_url)
      .filter((url) => typeof url === "string" && url.trim().length > 0)
      .slice(0, 3);

    if (urlsFromOutfitItems.length > 0) {
      return urlsFromOutfitItems;
    }

    const fallback = outfit?.imageUrl || outfit?.image_url;
    return fallback ? [fallback] : [];
  };

  const filteredItems = processedItems.filter((item) => {
    let matchesCategory = true;
    if (category === "tops") matchesCategory = item.type === "TOP";
    else if (category === "bottoms") matchesCategory = item.type === "BOTTOM";
    else if (category === "dresses") matchesCategory = item.type === "FULL_BODY";
    else if (category === "outerwear") matchesCategory = item.type === "OUTERWEAR";

    let matchesSearch = true;
    if (activeSearchText) {
      matchesSearch = item.name
        .toLowerCase()
        .includes(activeSearchText.toLowerCase());
    }

    return matchesCategory && matchesSearch;
  });

  const trips = dbTrips;

  return (
    <ThemedView gradient={false} style={{ flex: 1, alignItems: "center" }}>
      {!editItemsModalVisible && (
        <ClosetToggle isItems={isItems} toggleItems={handleToggleItems} />
      )}

      <View style={{ flex: 1, width: "100%", alignItems: "center" }}>
        {editItemsModalVisible ? (
          <EditItemsModal
            setModalVisible={setEditItemsModalVisible}
            itemId={currItemId}
          />
        ) : (
          <View style={{ width: "100%", flex: 1 }}>
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
                {isItemsLoading ? (
                  <View style={styles.centerState}>
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.tabIconSelected}
                    />
                    <ThemedText>Loading your items...</ThemedText>
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
                ) : (
                  <>
                    <View style={styles.categoryRow}>
                      <Pressable
                        style={styles.categoryBtn}
                        onPress={() =>
                          setCategory((prev) => (prev === "tops" ? "all" : "tops"))
                        }
                      >
                        <ThemedText style={{ color: theme.colors.text, fontSize: theme.sizes.text }}>
                          Tops
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        style={styles.categoryBtn}
                        onPress={() =>
                          setCategory((prev) => (prev === "bottoms" ? "all" : "bottoms"))
                        }
                      >
                        <ThemedText style={{ color: theme.colors.text, fontSize: theme.sizes.text }}>
                          Bottoms
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        style={styles.categoryBtn}
                        onPress={() =>
                          setCategory((prev) => (prev === "dresses" ? "all" : "dresses"))
                        }
                      >
                        <ThemedText style={{ color: theme.colors.text, fontSize: theme.sizes.text }}>
                          Dresses
                        </ThemedText>
                      </Pressable>
                    </View>

                    {isLoading ? (
                      <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
                        Loading your closet...
                      </ThemedText>
                    ) : filteredItems.length === 0 ? (
                      <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
                        No items found.
                      </ThemedText>
                    ) : (
                      <Items
                        items={filteredItems}
                        setCurrItemId={setCurrItemId}
                        currItemId={currItemId}
                        setEditItemsModalVisible={setEditItemsModalVisible}
                        editItemsModalVisible={editItemsModalVisible}
                      />
                    )}

                    <Pressable
                      style={styles.fab}
                      onPress={() => router.push("../closet/add-item")}
                    >
                      <Ionicons name="add-sharp" size={40} color="black" />
                    </Pressable>
                  </>
                )}
              </>
            ) : (
              <>
                <View style={styles.outfitToggle}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, mode === "trip" && styles.activeToggle]}
                    onPress={() => setMode("trip")}
                  >
                    <ThemedText>Trip</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, mode === "regular" && styles.activeToggle]}
                    onPress={() => setMode("regular")}
                  >
                    <ThemedText>Regular</ThemedText>
                  </TouchableOpacity>
                </View>

                {mode === "regular" && (
                  <FlatList
                    className="regularOutfit-list"
                    data={dbOutfits}
                    keyExtractor={(item, index) =>
                      item.outfitId?.toString() || index.toString()
                    }
                    numColumns={2}
                    style={{ marginVertical: 15, paddingHorizontal: 30, width: "100%" }}
                    columnWrapperStyle={{ justifyContent: "center", gap: 15 }}
                    ListEmptyComponent={() => (
                      <ThemedText style={{ textAlign: "center", marginTop: 20 }}>
                        No saved outfits yet.
                      </ThemedText>
                    )}
                    renderItem={({ item, index }) => (
                      <View style={styles.outfitCard}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedOutfit(item);
                            setIsOutfitModalVisible(true);
                          }}
                        >
                          <OutfitCoverImage
                            imageUrls={getOutfitCoverImages(item)}
                            itemIds={item.itemIds || []}
                            height={175}
                          />
                        </TouchableOpacity>

                        <View style={styles.outfitFooter}>
                          <ThemedText>Outfit {index + 1}</ThemedText>
                          <Pressable
                            onPress={() => {
                              setSelectedOutfit(item);
                              setIsOutfitModalVisible(true);
                            }}
                          >
                            <Feather
                              name="more-horizontal"
                              size={20}
                              color={theme.colors.text}
                            />
                          </Pressable>
                        </View>
                      </View>
                    )}
                  />
                )}

                {mode === "trip" && (
                  <FlatList
                    className="trip_Oufit_Details"
                    data={trips}
                    keyExtractor={(trip, index) => trip.id || index.toString()}
                    style={{ marginVertical: 15, paddingHorizontal: 30, width: "100%" }}
                    renderItem={({ item }) => (
                      <View className="TripOufit" style={styles.tripCard}>
                        <TouchableOpacity
                          onPress={() =>
                            router.push({
                              pathname: "/closet/outfitsHistory/tripOutfits",
                              params: { id: item.id },
                            })
                          }
                        >
                          <View style={styles.tripHeader}>
                            <View>
                              <ThemedText> {item.name} </ThemedText>
                              <ThemedText>{item.dates}</ThemedText>
                              <ThemedText># Trip</ThemedText>
                            </View>
                            <Ionicons name="ellipsis-horizontal" size={18} />
                          </View>
                        </TouchableOpacity>
                        <View style={styles.previewRow}>
                          <ScrollView horizontal showsHorizontalScrollIndicator>
                            {(item.outfits || []).map((outfit, index) => (
                              <View key={index} style={styles.previewBox} />
                            ))}
                          </ScrollView>
                        </View>
                      </View>
                    )}
                  />
                )}

                <OutfitDetailsModal
                  visible={isOutfitModalVisible}
                  outfit={selectedOutfit}
                  onClose={() => setIsOutfitModalVisible(false)}
                  onDelete={handleDeleteOutfit}
                  theme={theme}
                />
              </>
            )}
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  centerState: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  retryButton: {
    backgroundColor: "#d6c6b8",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 38,
    justifyContent: "space-between",
    padding: 15,
  },
  categoryBtn: {
    backgroundColor: "#d6c6b8",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  outfitCard: {
    backgroundColor: "#d6c6b8",
    borderRadius: 10,
    marginBottom: 20,
    width: "48%",
  },
  outfitImage: {
    width: "100%",
    height: 175,
    marginBottom: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  outfitPlaceholder: {
    height: 175,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  outfitFooter: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    alignItems: "center",
  },
  outfitToggle: {
    flexDirection: "row",
    margin: 15,
    backgroundColor: "#e2d7cd",
    borderRadius: 10,
    alignSelf: "stretch",
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#b49480",
    borderRadius: 10,
  },
  tripCard: {
    backgroundColor: "#d6c6b8",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: "row",
  },
  previewBox: {
    width: 70,
    height: 70,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginRight: 10,
  },
  fab: {
    backgroundColor: "#b49480",
    borderRadius: 100,
    bottom: 30,
    padding: 5,
    position: "absolute",
    right: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
});