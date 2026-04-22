import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState, useEffect, useRef } from "react";
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
import { apiClient } from "../../scripts/apiClient";
import EditItemsModal from "../closet/edit-items-modal";
import OutfitDetailsModal from "../closet/outfit-details-modal";

export default function ClosetScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // --- UI States ---
  const [isItems, setIsItems] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeSearchText, setActiveSearchText] = useState("");
  const [outfitSearchText, setOutfitSearchText] = useState("");
  const [tripSearchText, setTripSearchText] = useState("");

  const [activeOutfitSearchText, setActiveOutfitSearchText] = useState("");
  const [isOutfitsLoading, setIsOutfitsLoading] = useState(false);
  const [isDeleteTripModalVisible, setIsDeleteTripModalVisible] = useState(false);
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);
  const [pendingDeleteTripId, setPendingDeleteTripId] = useState(null);

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


  // All Regular Outfit Related Logic Starts here 
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

  const formatOutfitDate = (createdAt) => {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openOutfitDetails = (outfitId) => {
    router.push({
      pathname: "/closet/outfitsHistory/itemProperty",
      params: {
        outfitId,
        isOutfit: "true",
      },
    });
  };

  const confirmDeleteOutfit = async () => {
    if (!pendingDeleteOutfitId || isDeletingOutfit) return;
    try {
      setIsDeletingOutfit(true);
      const didDelete = await handleDeleteOutfit(pendingDeleteOutfitId);
      if (didDelete) {
        setIsDeleteOutfitModalVisible(false);
        setPendingDeleteOutfitId(null);
      }
    } finally {
      setIsDeletingOutfit(false);
    }
  };

  const handleDeleteOutfit = async (outfitId) => {
    try {
      await apiClient.delete(`/api/outfits/${outfitId}`);
      setDbOutfits((prev) =>
        prev.filter((o) => o.outfitId !== outfitId && o.id !== outfitId),
      );
      setIsOutfitModalVisible(false);
      return true;
    } catch (error) {
      console.error("Failed to delete outfit:", error);
      return false;
    }
  };

  //TODO: Placeholder for  share code right now, just shares a text message. Can update to share outfit image or details later....
  const handleShareOutfit = async (outfit, index) => {
    try {
      const itemCount = outfit?.itemIds?.length || 0;
      await Share.share({
        message: `Check out Outfit ${index + 1} from my closet on StyleFinder (${itemCount} item${itemCount === 1 ? "" : "s"})!`,
      });
    } catch (error) {
      console.error("Failed to share outfit:", error);
    }
  };

  // All Regualr Outfit releare logic ends here. 
  const filteredOutfits = dbOutfits
    .filter((outfit) => {
      if (!activeOutfitSearchText) return true;
      const query = activeOutfitSearchText.toLowerCase();
      const outfitDate = formatOutfitDate(outfit.createdAt) || "";
      return outfitDate.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  const paddedOutfits =
    filteredOutfits.length % 2 !== 0
      ? [...filteredOutfits, { id: "empty", isEmpty: true }]
      : filteredOutfits;
      

  // All Trip Outfit Related Logic Starts here 
  const fetchUserTrips = async (uid) => {
    try {
      const response = await apiClient.get(`/api/trips/user/${uid}`);
      setDbTrips(response.data);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  const confirmDeleteTrip = async () => {
    if (!pendingDeleteTripId || isDeletingTrip) return;
    try {
      setIsDeletingTrip(true);
      const didDelete = await handleDeleteTrip(pendingDeleteTripId);
      if (didDelete) {
        setIsDeleteTripModalVisible(false);
        setPendingDeleteTripId(null);
      }
    } finally {
      setIsDeletingTrip(false);
    }
  };

  const dummyTrips = [
    {
      id: "t1",
      name: "NYC Trip",
      location: "New York City",
      dates: "04/19/26 - 04/24/26",
      outfits: [{}, {}, {}, {}],
    },
  ];

  const trips = dummyTrips.filter((trip) => {
    if (!tripSearchText) return true;
    const query = tripSearchText.toLowerCase();
    return (
      trip.name.toLowerCase().includes(query) ||
      trip.location.toLowerCase().includes(query)
    );
  });

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
                <View style={styles.outfitToggle}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      mode === "trip" && styles.activeToggle,
                    ]}
                    onPress={() => setMode("trip")}
                  >
                    <ThemedText>Trip</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      mode === "regular" && styles.activeToggle,
                    ]}
                    onPress={() => setMode("regular")}
                  >
                    <ThemedText>Regular</ThemedText>
                  </TouchableOpacity>
                </View>

                {mode === "regular" && (
                  <>
                    <View
                      style={{
                        width: "100%",
                        paddingHorizontal: 30,
                        marginTop: 15,
                      }}
                    >
                      <SearchBar
                        value={outfitSearchText}
                        onChangeText={(text) => {
                          setOutfitSearchText(text);
                          if (text === "") setActiveOutfitSearchText("");
                        }}
                        placeholder="Search by date (e.g., Jan 15, 2026)"
                        onSubmit={() =>
                          setActiveOutfitSearchText(outfitSearchText)
                        }
                      />
                    </View>
                    {isOutfitsLoading && (
                      <View style={styles.centerState}>
                        <ActivityIndicator
                          size="large"
                          color={theme.colors.tabIconSelected}
                        />
                        <ThemedText>Loading outfits...</ThemedText>
                      </View>
                    )}
                    {!isOutfitsLoading && (
                      <FlatList
                        className="regularOutfit-list"
                        data={paddedOutfits}
                        keyExtractor={(item, index) =>
                          item.outfitId?.toString() || index.toString()
                        }
                        numColumns={2}
                        style={{
                          marginVertical: 15,
                          paddingHorizontal: 30,
                          width: "100%",
                        }}
                        columnWrapperStyle={{
                          justifyContent: "flex-start",
                          gap: 15,
                        }}
                        ListEmptyComponent={() =>
                          isLoading ? (
                            <View style={styles.centerState}>
                              <ActivityIndicator
                                size="large"
                                color={theme.colors.tabIconSelected}
                              />
                              <ThemedText>Loading outfits...</ThemedText>
                            </View>
                          ) : (
                            <ThemedText
                              style={{ textAlign: "center", marginTop: 20 }}
                            >
                              No saved outfits yet.
                            </ThemedText>
                          )
                        }
                        renderItem={({ item, index }) => {
                          if (item.isEmpty) {
                            return <View style={styles.outfitSpacer} />;
                          }

                          return (
                            <View style={styles.outfitCard}>
                              <TouchableOpacity
                                onPress={() => openOutfitDetails(item.outfitId)}
                              >
                                <View style={styles.outfitViewBadge}>
                                  <Ionicons
                                    name="eye-outline"
                                    size={18}
                                    color={theme.colors.text}
                                  />
                                </View>
                                {getOutfitCoverImage(item) ? (
                                  <Image
                                    source={{ uri: getOutfitCoverImage(item) }}
                                    style={styles.outfitImage}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={styles.outfitPlaceholder}>
                                    <ThemedText
                                      style={{ color: "#666", fontSize: 12 }}
                                    >
                                      Items: {item.itemIds?.length || 0}
                                    </ThemedText>
                                  </View>
                                )}
                              </TouchableOpacity>

                              <View style={styles.outfitFooter}>
                                <View>
                                  {item.createdAt && (
                                    <ThemedText
                                      style={{ fontSize: 14, color: "#000000" }}
                                    >
                                      {formatOutfitDate(item.createdAt)}
                                    </ThemedText>
                                  )}
                                </View>
                                <View style={styles.outfitActions}>
                                  <Pressable
                                    onPress={() =>
                                      handleShareOutfit(item, index)
                                    }
                                    hitSlop={8}
                                  >
                                    <Ionicons
                                      name="share-social-outline"
                                      size={19}
                                      color={theme.colors.text}
                                    />
                                  </Pressable>
                                  <Pressable
                                    onPress={() =>
                                      requestDeleteOutfit(
                                        item.outfitId || item.id,
                                      )
                                    }
                                    hitSlop={8}
                                  >
                                    <Ionicons
                                      name="trash-outline"
                                      size={19}
                                      color={theme.colors.text}
                                    />
                                  </Pressable>
                                </View>
                              </View>
                            </View>
                          );
                        }}
                      />
                    )}
                  </>
                )}

                {mode === "trip" && (
                  <>
                    <View
                      style={{
                        width: "100%",
                        paddingHorizontal: 30,
                        marginTop: 15,
                      }}
                    >
                      <SearchBar
                        value={tripSearchText}
                        onChangeText={(text) => {
                          setTripSearchText(text);
                        }}
                        placeholder="Search by trip location"
                        onSubmit={() => {}}
                      />
                    </View>
                    <FlatList
                      className="trip_Oufit_Details"
                      data={trips}
                      keyExtractor={(trip, index) =>
                        trip.id || index.toString()
                      }
                      style={{
                        marginVertical: 15,
                        paddingHorizontal: 15,
                        width: "100%",
                      }}
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
                              <View style={styles.outfitViewBadge}>
                                <Ionicons
                                  name="eye-outline"
                                  size={18}
                                  color={theme.colors.text}
                                />
                              </View>
                            </View>
                          </TouchableOpacity>

                          <View style={styles.previewRow}>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator
                            >
                              {(item.outfits || []).map((outfit, index) => (
                                <View key={index} style={styles.previewBox} />
                              ))}
                            </ScrollView>
                          </View>
                          <View style={styles.tripFooter}>
                            <Pressable
                              onPress={() => handleShareTrip(item)}
                              hitSlop={8}
                            >
                              <Ionicons
                                name="share-social-outline"
                                size={19}
                                color={theme.colors.text}
                              />
                            </Pressable>
                            <Pressable
                              onPress={() => requestDeleteTrip(item.id)}
                              hitSlop={8}
                            >
                              <Ionicons
                                name="trash-outline"
                                size={19}
                                color={theme.colors.text}
                              />
                            </Pressable>
                          </View>
                        </View>
                      )}
                    />
                  </>
                )}

                <OutfitDetailsModal
                  visible={isOutfitModalVisible}
                  outfit={selectedOutfit}
                  onClose={() => setIsOutfitModalVisible(false)}
                  onDelete={handleDeleteOutfit}
                  theme={theme}
                />

                <Modal
                  visible={isDeleteOutfitModalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => {
                    if (isDeletingOutfit) return;
                    setIsDeleteOutfitModalVisible(false);
                    setPendingDeleteOutfitId(null);
                  }}
                >
                  <View style={styles.confirmOverlay}>
                    <View
                      style={[
                        styles.confirmCard,
                        { backgroundColor: theme.colors.card },
                      ]}
                    >
                      <ThemedText
                        style={{
                          fontSize: theme.sizes.h2,
                          fontWeight: "700",
                          marginBottom: 8,
                          fontFamily: theme.fonts.bold,
                        }}
                      >
                        Delete this outfit?
                      </ThemedText>
                      <ThemedText style={styles.confirmText}>
                        This action cannot be undone. This outfit will be
                        removed permanently.
                      </ThemedText>

                      <View style={styles.confirmActions}>
                        <TouchableOpacity
                          style={[
                            styles.confirmBtn,
                            { backgroundColor: theme.colors.lightBrown },
                          ]}
                          onPress={() => {
                            if (isDeletingOutfit) return;
                            setIsDeleteOutfitModalVisible(false);
                            setPendingDeleteOutfitId(null);
                          }}
                          disabled={isDeletingOutfit}
                        >
                          <ThemedText>Cancel</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.confirmBtn,
                            {
                              backgroundColor: theme.colors.tabIconSelected,
                              opacity: isDeletingOutfit ? 0.7 : 1,
                            },
                          ]}
                          onPress={confirmDeleteOutfit}
                          disabled={isDeletingOutfit}
                        >
                          {isDeletingOutfit ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <ThemedText style={{ color: theme.colors.text }}>
                              Delete
                            </ThemedText>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>

                <Modal
                  visible={isDeleteTripModalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => {
                    if (isDeletingTrip) return;
                    setIsDeleteTripModalVisible(false);
                    setPendingDeleteTripId(null);
                  }}
                >
                  <View style={styles.confirmOverlay}>
                    <View
                      style={[
                        styles.confirmCard,
                        { backgroundColor: theme.colors.card },
                      ]}
                    >
                      <ThemedText
                        style={{
                          fontSize: theme.sizes.h2,
                          fontWeight: "700",
                          marginBottom: 8,
                          fontFamily: theme.fonts.bold,
                        }}
                      >
                        Delete this trip?
                      </ThemedText>
                      <ThemedText style={styles.confirmText}>
                        This action cannot be undone. This trip and all its
                        outfits will be removed permanently.
                      </ThemedText>

                      <View style={styles.confirmActions}>
                        <TouchableOpacity
                          style={[
                            styles.confirmBtn,
                            { backgroundColor: theme.colors.lightBrown },
                          ]}
                          onPress={() => {
                            if (isDeletingTrip) return;
                            setIsDeleteTripModalVisible(false);
                            setPendingDeleteTripId(null);
                          }}
                          disabled={isDeletingTrip}
                        >
                          <ThemedText>Cancel</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.confirmBtn,
                            {
                              backgroundColor: theme.colors.tabIconSelected,
                              opacity: isDeletingTrip ? 0.7 : 1,
                            },
                          ]}
                          onPress={confirmDeleteTrip}
                          disabled={isDeletingTrip}
                        >
                          {isDeletingTrip ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <ThemedText style={{ color: theme.colors.text }}>
                              Delete
                            </ThemedText>
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
  outfitSpacer: {
    width: "48%",
    marginBottom: 20,
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
  outfitActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: "100%",
    borderRadius: 16,
    padding: 18,
  },
  confirmText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  outfitViewBadge: {
    position: "absolute",
    right: 6,
    top: 6,
    borderRadius: 12,
    padding: 4,
    backgroundColor: "#fff",
    zIndex: 2,
  },
  outfitToggle: {
    flexDirection: "row",
    marginHorizontal: 30,
    marginTop: 15,
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
  tripFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
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
