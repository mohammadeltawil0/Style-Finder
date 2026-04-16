import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
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

const OUTFIT_PREVIEW_PLACEHOLDER = require("../../assets/images/placeholder.png");

export default function ClosetScreen() {
  const [isItems, setIsItems] = useState(true);
  const [searchText, setSearchText] = useState(""); // state to hold the input when user presses enter
  const [category, setCategory] = useState("all"); // state to hold the selected category
  const [editItemsModalVisible, setEditItemsModalVisible] = useState(false);
  const [currItemId, setCurrItemId] = useState(null); // state to hold the id of the item that user wants to edit when they click on the three dots; this is used to pass to the edit item modal so that we know which item user is editing
  const [mode, setMode] = useState("regular"); // outfit toggle: regular/trip
  const [userId, setUserId] = useState(null);

  const params = useLocalSearchParams();
  const router = useRouter();

  // Dummy data for outfits and trips
  // TODO: fetch data from database when we have actual data

  // const [outfits, setOutfits] = useState([]);
  // useEffect(() => {
  //   const fetchOutfits = async () => {
  //     setOutfits(data);
  //   };
  //   fetchOutfits();
  // }, []);

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

  // replace useFocusEffect loadData with:
  const {
    data: items = [],
    isLoading: isItemsLoading,
    isError: isItemsError,
    error: itemsError,
    refetch,
  } = useQuery({
    queryKey: ['items', userId],
    queryFn: fetchItems,
    enabled: !!userId,
  });

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refetch();
      }
    }, [refetch, userId]),
  );

  const outfits = [
    { id: "o1", name: "Outfit1", items: [{}, {}] },
    { id: "o2", name: "Outfit2", items: [{}] },
    { id: "o3", name: "Outfit3", items: [{}, {}, {}] },
    { id: "o4", name: "Outfit1", items: [{}] },
    { id: "o5", name: "Outfit2", items: [{}, {}] },
    { id: "o6", name: "Outfit3", items: [{}, {}, {}] },
  ];

  const trips = [
    {
      id: "t1",
      name: "NYC Trip",
      location: "New York City",
      dates: "03/01/26 - 03/05/26",
      outfits: [{}, {}, {}, {}, {}, {}],
    },
    {
      id: "t2",
      name: "Beach Trip",
      location: "Miami Beach",
      dates: "04/10/26 - 04/15/26",
      outfits: [{}, {}, {}, {}, {}, {}],
    },
    {
      id: "t3",
      name: "NYC Trip",
      location: "New York City",
      dates: "03/01/26 - 03/05/26",
      outfits: [{}, {}, {}, {}, {}, {}],
    },
    {
      id: "t4",
      name: "Beach Trip",
      location: "Miami Beach",
      dates: "04/10/26 - 04/15/26",
      outfits: [{}, {}, {}, {}, {}, {}],
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const loadTabState = async () => {
        try {
          // navigating in home screen logic
          if (params.tab === "outfits") {
            setIsItems(false);
            await AsyncStorage.setItem("closetTab", "outfits");
            params.tab = null; // clear the param so that it doesn't override future state changes
          } else if (params.tab === "items") {
            setIsItems(true);
            await AsyncStorage.setItem("closetTab", "items");
            params.tab = null; // clear the param so that it doesn't override future state changes
          } else {
            const savedTab = await AsyncStorage.getItem("closetTab");
            setIsItems(savedTab !== "outfits");
          }
        } catch (e) {
          console.error("Error loading tab state:", e);
        }
      };
      loadTabState();
    }, [params.tab]),
  );

  const handleToggleItems = async (value) => {
    setIsItems(value);
    await AsyncStorage.setItem("closetTab", value ? "items" : "outfits");
  };

  const theme = useTheme();
  const handleSearchSubmit = async (e) => {
    console.log("Search submitted with text:", searchText);
    //setSearchText("");
  };

  //implemented filtering method for both categories + search function
  const normalize = (text) => text?.toString().toLowerCase().replace(/_/g, " "); //normalize helper
  const materialMap = {
    1: "cotton",
    2: "linen hemp",
    3: "wool fleece",
    4: "silk satin",
    5: "leather faux leather",
    6: "synthetics polyester nylon spandex",
    7: "other",
  };

  const patternMap = {
    GEOMETRIC_OR_ABSTRACT: "geometric abstract",
    SOLID: "solid",
    STRIPED: "striped",
    GRAPHIC: "graphic",
    FLORAL: "floral",
    PLAID_OR_FLANNEL: "plaid flannel",
  };

  const eventMap = {
    ACTIVE_OR_SPORT: "sport active gym",
    FORMAL: "formal dressy",
    CASUAL: "casual everyday",
    WORK_OR_SMART: "work",
    PARTY_OR_NIGHT_OUT: "party night out social",
  };

  const fitMap = {
    1: "slim fitted tight",
    2: "regular normal",
    3: "loose oversized baggy",
  };

  const filteredItems = items.filter((item) => {
    //category filter
    if (category !== "all") {
      const typeMap = {
        tops: "TOP",
        bottoms: "BOTTOM",
        dresses: "DRESS",
        outerwear: "OUTERWEAR",
      };

      if (item.type !== typeMap[category]) {
        return false;
      }
    }
    const terms = searchText.toLowerCase().trim().split(/\s+/).filter(Boolean);

    //search filter
    if (terms.length > 0) {
      const searchableText = [
        normalize(item.type),
        normalize(item.color),
        normalize(item.seasonWear),
        normalize(item.formality),
        normalize(item.fit),
        normalize(item.pattern),

        materialMap[item.material],
        patternMap[item.pattern],
        eventMap[item.formality],
        fitMap[item.fit],
      ]
        .filter(Boolean)
        .join(" ");
      const words = searchableText.split(" ");
      console.log("SEARCH TERMS:", terms);
      console.log("ITEM TEXT:", searchableText);
      const matches = terms.every((term) =>
        words.some((word) => word.startsWith(term)),
      );
      if (!matches) return false;
    }
    return true;
  });

  const filteredTrips = trips.filter((trip) => {
    const terms = searchText.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;

    const searchableTripText = [trip.location, trip.name]
      .map(normalize)
      .filter(Boolean)
      .join(" ");

    return terms.every((term) => searchableTripText.includes(term));
  });

  return (
    <ThemedView gradient={false} style={{ flex: 1, alignItems: "center" }}>
      {!editItemsModalVisible && (
        <ClosetToggle isItems={isItems} toggleItems={handleToggleItems} />
      )}

      <View
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          position: "relative",
        }}
      >
        {editItemsModalVisible ? (
          <EditItemsModal
            item={items.find((i) => i.itemId === currItemId)}
            setModalVisible={setEditItemsModalVisible}
          />
        ) : (
          <View style={{ flex: 1, width: "100%" }}>
            {(isItems || mode === "trip") && (
              <SearchBar
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmit={handleSearchSubmit}
              />
            )}

            {isItems ? (
              <>
                {isItemsLoading ? (
                  <View
                    style={{
                      marginTop: 40,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <ActivityIndicator
                      size="large"
                      color={theme.colors.tabIconSelected}
                    />
                    <ThemedText>Loading your items...</ThemedText>
                  </View>
                ) : isItemsError ? (
                  <View
                    style={{
                      marginTop: 40,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      paddingHorizontal: 24,
                    }}
                  >
                    <ThemedText style={{ textAlign: "center" }}>
                      {itemsError?.message || "Could not load items. Please try again."}
                    </ThemedText>
                    <Pressable
                      onPress={() => refetch()}
                      style={{
                        backgroundColor: theme.colors.lightBrown,
                        borderRadius: 10,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                      }}
                    >
                      <ThemedText>Retry</ThemedText>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View
                      className="item-categories"
                      style={{
                        flexDirection: "row",
                        gap: 38,
                        justifyContent: "space-between",
                        padding: 15,
                      }}
                    >
                      <Pressable
                        className="tops-category"
                        style={{
                          backgroundColor: theme.colors.lightBrown,
                          borderRadius: 10,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                        onPress={() =>
                          setCategory((prev) => (prev === "tops" ? "all" : "tops"))
                        }
                      >
                        <ThemedText
                          style={{
                            color: theme.colors.text,
                            fontSize: theme.sizes.text,
                          }}
                        >
                          Tops
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        className="bottoms-category"
                        style={{
                          backgroundColor: theme.colors.lightBrown,
                          borderRadius: 10,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                        onPress={() =>
                          setCategory((prev) =>
                            prev === "bottoms" ? "all" : "bottoms",
                          )
                        }
                      >
                        <ThemedText
                          style={{
                            color: theme.colors.text,
                            fontSize: theme.sizes.text,
                          }}
                        >
                          Bottoms
                        </ThemedText>
                      </Pressable>

                      <Pressable
                        className="dresses-category"
                        style={{
                          backgroundColor: theme.colors.lightBrown,
                          borderRadius: 10,
                          paddingHorizontal: 20,
                          paddingVertical: 10,
                        }}
                        onPress={() =>
                          setCategory((prev) =>
                            prev === "dresses" ? "all" : "dresses",
                          )
                        }
                      >
                        <ThemedText
                          style={{
                            color: theme.colors.text,
                            fontSize: theme.sizes.text,
                          }}
                        >
                          Dresses
                        </ThemedText>
                      </Pressable>
                    </View>

                    <Items
                      items={filteredItems}
                      setCurrItemId={setCurrItemId}
                      currItemId={currItemId}
                      setEditItemsModalVisible={setEditItemsModalVisible}
                      editItemsModalVisible={editItemsModalVisible}
                    />

                    <Pressable
                      style={{
                        backgroundColor: theme.colors.tabIconSelected,
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
                      }}
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
                  <FlatList
                    className="regularOutfit-list"
                    data={outfits}
                    keyExtractor={(outfit) => outfit.id}
                    numColumns={2}
                    style={{
                      marginVertical: 15,
                      paddingHorizontal: 30,
                      width: "100%",
                    }}
                    columnWrapperStyle={{ justifyContent: "center", gap: 15 }}
                    renderItem={({ item }) => {
                      const previewCount = Math.min(item.items.length, 3);
                      const previewSizeStyle =
                        previewCount === 1
                          ? styles.regularPreviewImageOne
                          : previewCount === 2
                            ? styles.regularPreviewImageTwo
                            : styles.regularPreviewImageThree;

                      return (
                        <TouchableOpacity
                          className="regularOufit"
                          activeOpacity={0.85}
                          style={styles.regularOutfitCard}
                          onPress={() =>
                            router.push({
                              pathname: "/closet/outfitsHistory/itemProperty",
                              params: { id: item.id },
                            })
                          }
                        >
                          <View style={styles.viewIconBadge}>
                            <Ionicons
                              name="eye-outline"
                              size={18}
                              color={theme.colors.text}
                            />
                          </View>

                          <View style={styles.regularPreviewContainer}>
                            {item.items.slice(0, 3).map((_, index) => (
                              <Image
                                key={`${item.id}-${index}`}
                                source={OUTFIT_PREVIEW_PLACEHOLDER}
                                style={[styles.regularPreviewImage, previewSizeStyle]}
                                resizeMode="cover"
                              />
                            ))}
                          </View>

                          {item.items.length > 3 && (
                            <View style={styles.previewCountBadge}>
                              <ThemedText style={styles.previewCountText}>
                                +{item.items.length - 3}
                              </ThemedText>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                )}

                {mode === "trip" && (
                  <FlatList
                    className="trip_Oufit_Details"
                    data={filteredTrips}
                    keyExtractor={(trip) => trip.id}
                    style={{
                      marginVertical: 15,
                      paddingHorizontal: 30,
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
                              <ThemedText> {item.location} </ThemedText>
                              <ThemedText>{item.dates}</ThemedText>
                              <ThemedText># Trip</ThemedText>
                            </View>
                            <View style={styles.viewIconBadge}>
                              <Ionicons
                                name="eye-outline"
                                size={18}
                                color={theme.colors.text}
                              />
                            </View>
                          </View>
                        </TouchableOpacity>

                        <View style={styles.previewRow}>
                          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                            {item.outfits.map((outfit, index) => (
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
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  regularOutfitCard: {
    backgroundColor: "#d6c6b8",
    borderRadius: 14,
    padding: 14,
    width: "48%",
    marginBottom: 16,
    minHeight: 175,
    position: "relative",
  },
  regularPreviewContainer: {
    flexDirection: "column",
    gap: 6,
    marginTop: 26,
    alignItems: "center",
  },
  regularPreviewImage: {
    borderRadius: 8,
  },
  regularPreviewImageOne: {
    width: 90,
    height: 64,
  },
  regularPreviewImageTwo: {
    width: 74,
    height: 50,
  },
  regularPreviewImageThree: {
    width: 58,
    height: 38,
  },
  viewIconBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  previewCountBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewCountText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
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
});
