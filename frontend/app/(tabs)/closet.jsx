import { useCallback, useState, useEffect } from "react";
import Feather from "@expo/vector-icons/Feather";
import {
  Pressable,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
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
import { ScrollView } from "react-native";
import EditItemsModal from "../closet/edit-items-modal";
import OutfitDetailsModal from "../closet/outfit-details-modal"; // NEW IMPORT!
import { apiClient } from "../../scripts/apiClient";

export default function ClosetScreen() {
  const [isItems, setIsItems] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeSearchText, setActiveSearchText] = useState("");
  const [category, setCategory] = useState("all");
  const [editItemsModalVisible, setEditItemsModalVisible] = useState(false);
  const [currItemId, setCurrItemId] = useState(null);

  // --- Database States ---
  const [dbItems, setDbItems] = useState([]);
  const [dbOutfits, setDbOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Modal States ---
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isOutfitModalVisible, setIsOutfitModalVisible] = useState(false);

  const params = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const [mode, setMode] = useState("regular");

  // Dummy Trips
  const trips = [
    { id: "t1", name: "NYC Trip", dates: "03/01/26 - 03/05/26", outfits: [{}, {}, {}, {}, {}, {}] },
    { id: "t2", name: "Beach Trip", dates: "04/10/26 - 04/15/26", outfits: [{}, {}, {}, {}, {}, {}] },
    { id: "t3", name: "NYC Trip", dates: "03/01/26 - 03/05/26", outfits: [{}, {}, {}, {}, {}, {}] },
    { id: "t4", name: "Beach Trip", dates: "04/10/26 - 04/15/26", outfits: [{}, {}, {}, {}, {}, {}] },
  ];

  // --- API INTEGRATION ---
  const fetchUserItems = async (userId) => {
    try {
      const response = await apiClient.get(`/api/items/user/${userId}`);
      if (response.status === 200) setDbItems(response.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const fetchUserOutfits = async (userId) => {
    try {
      const response = await apiClient.get(`/api/outfits/user/${userId}`);
      if (response.status === 200) {
        const formattedOutfits = response.data.map(outfit => ({
          ...outfit,
          itemIds: outfit.itemIds || (outfit.outfitItems ? outfit.outfitItems.map(oi => oi.item.itemId) : [])
        }));
        setDbOutfits(formattedOutfits);
      }
    } catch (error) {
      console.error("Failed to fetch outfits:", error);
    }
  };

  useFocusEffect(
      useCallback(() => {
        const loadTabStateAndData = async () => {
          try {
            setIsLoading(true);
            const userIdStr = await AsyncStorage.getItem("userId");
            const userId = userIdStr ? parseInt(userIdStr, 10) : null;

            if (params.tab === "outfits") {
              setIsItems(false);
              await AsyncStorage.setItem("closetTab", "outfits");
              params.tab = null;
            } else if (params.tab === "items") {
              setIsItems(true);
              await AsyncStorage.setItem("closetTab", "items");
              params.tab = null;
            } else {
              const savedTab = await AsyncStorage.getItem("closetTab");
              setIsItems(savedTab !== "outfits");
            }

            if (userId) {
              await Promise.all([fetchUserItems(userId), fetchUserOutfits(userId)]);
            }
          } catch (e) {
            console.error("Error loading closet state:", e);
          } finally {
            setIsLoading(false);
          }
        };

        loadTabStateAndData();
      }, [params.tab])
  );

  const handleToggleItems = async (value) => {
    setIsItems(value);
    await AsyncStorage.setItem("closetTab", value ? "items" : "outfits");
  };

  const handleSearchSubmit = () => setActiveSearchText(searchText);

  const handleDeleteOutfit = async (outfitId) => {
    try {
      await apiClient.delete(`/api/outfits/${outfitId}`);
      setDbOutfits(prev => prev.filter(o => o.outfitId !== outfitId && o.id !== outfitId));
      setIsOutfitModalVisible(false);
    } catch (error) {
      console.error("Failed to delete outfit:", error);
    }
  };

  // --- DATA PROCESSING & FILTERING ---
  const formatItemType = (type) => {
    if (!type) return "Item";
    let cleanStr = type.replace(/_/g, " ");
    return cleanStr.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
  };

  const processedItems = dbItems.map((item, index) => ({
    ...item,
    id: item.itemId,
    name: `${formatItemType(item.type)} (Item ${index + 1})`,
  }));

  const getOutfitCoverImage = (outfit) => {
    const firstOutfitItem = outfit?.outfitItems?.[0]?.item;
    return firstOutfitItem?.imageUrl || outfit?.imageUrl || null;
  };

  const filteredItems = processedItems.filter((item) => {
    let matchesCategory = true;
    if (category === "tops") matchesCategory = item.type === "TOP";
    else if (category === "bottoms") matchesCategory = item.type === "BOTTOM";
    else if (category === "dresses") matchesCategory = item.type === "FULL_BODY";
    else if (category === "outerwear") matchesCategory = item.type === "OUTERWEAR";

    let matchesSearch = true;
    if (activeSearchText) matchesSearch = item.name.toLowerCase().includes(activeSearchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
      <ThemedView gradient={false} style={{ flex: 1, alignItems: "center" }}>
        <ClosetToggle isItems={isItems} toggleItems={handleToggleItems} />
        <View style={{ flex: 1, width: "100%", alignItems: "center" }}>
          {editItemsModalVisible ? (
              <EditItemsModal setModalVisible={setEditItemsModalVisible} itemId={currItemId} />
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
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15, padding: 15, paddingBottom: 20 }} style={{ flexGrow: 0 }}>
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

                      {isLoading ? (
                          <ThemedText style={{ textAlign: "center", marginTop: 20 }}>Loading your closet...</ThemedText>
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
                        <TouchableOpacity style={[styles.toggleBtn, mode === "trip" && styles.activeToggle]} onPress={() => setMode("trip")}>
                          <ThemedText>Trip</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.toggleBtn, mode === "regular" && styles.activeToggle]} onPress={() => setMode("regular")}>
                          <ThemedText>Regular</ThemedText>
                        </TouchableOpacity>
                      </View>

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
                              renderItem={({ item, index }) => (
                                  <View style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.lightBrown, borderRadius: 10, marginBottom: 20, width: "48%" }}>
                                    <TouchableOpacity onPress={() => { setSelectedOutfit(item); setIsOutfitModalVisible(true); }}>
                                      {getOutfitCoverImage(item) ? (
                                        <Image
                                          source={{ uri: getOutfitCoverImage(item) }}
                                          style={{ width: "100%", height: 175, marginBottom: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                                          resizeMode="cover"
                                        />
                                      ) : (
                                        <View style={{ height: 175, marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
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
                              )}
                          />
                      )}

                      {/* TRIP CODE */}
                      {mode === "trip" && (
                          <FlatList
                              className="trip_Oufit_Details"
                              data={trips}
                              keyExtractor={(trip) => trip.id}
                              style={{ marginVertical: 15, paddingHorizontal: 30, width: "100%" }}
                              renderItem={({ item }) => (
                                  <View className="TripOufit" style={styles.tripCard}>
                                    <TouchableOpacity onPress={() => router.push({ pathname: "/closet/outfitsHistory/tripOutfits", params: { id: item.id } })}>
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
                                      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                        {item.outfits.map((outfit, index) => (<View key={index} style={styles.previewBox} />))}
                                      </ScrollView>
                                    </View>
                                  </View>
                              )}
                          />
                      )}

                      {/* MODAL COMPONENT USING THE NEW EXTERNAL IMPORT */}
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
  outfitToggle: { flexDirection: "row", margin: 15, backgroundColor: "#e2d7cd", borderRadius: 10, alignSelf: "stretch" },
  toggleBtn: { flex: 1, padding: 10, alignItems: "center" },
  activeToggle: { backgroundColor: "#b49480", borderRadius: 10 },
  tripCard: { backgroundColor: "#d6c6b8", borderRadius: 14, padding: 14, marginHorizontal: 16, marginBottom: 16 },
  tripHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  previewRow: { flexDirection: "row" },
  previewBox: { width: 70, height: 70, backgroundColor: "#eee", borderRadius: 8, marginRight: 10 },
  fab: { backgroundColor: "#b49480", borderRadius: 100, bottom: 30, padding: 5, position: "absolute", right: 30, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3.84, elevation: 5 },
});