import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
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

export default function ClosetScreen() {
  const [isItems, setIsItems] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeSearchText, setActiveSearchText] = useState("");
  const [outfitSearchText, setOutfitSearchText] = useState("");
  const [activeOutfitSearchText, setActiveOutfitSearchText] = useState("");
  const [tripSearchText, setTripSearchText] = useState("");
  const [category, setCategory] = useState("all");
  const [editItemsModalVisible, setEditItemsModalVisible] = useState(false);
  const [mode, setMode] = useState("regular");
  const [userId, setUserId] = useState(null);
  const [currItemId, setCurrItemId] = useState(null);
  const [dbOutfits, setDbOutfits] = useState([]);
  const [dbTrips, setDbTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOutfitsLoading, setIsOutfitsLoading] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  const [isOutfitModalVisible, setIsOutfitModalVisible] = useState(false);
  const [isDeleteOutfitModalVisible, setIsDeleteOutfitModalVisible] =
    useState(false);
  const [pendingDeleteOutfitId, setPendingDeleteOutfitId] = useState(null);
  const [isDeletingOutfit, setIsDeletingOutfit] = useState(false);
  const [isDeleteTripModalVisible, setIsDeleteTripModalVisible] =
    useState(false);
  const [pendingDeleteTripId, setPendingDeleteTripId] = useState(null);
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);

  const [autoOpenOutfitId, setAutoOpenOutfitId] = useState(null);

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

  const formatOutfitDate = (createdAt) => {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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

  // TODO: Uncommend where this is user, had it, may be changed when trip feature implemented, just want to make sure outfits are loading for now.
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

  const handledOutfitId = useRef(null);

  // Replace your openOutfitId effect with this
  useEffect(() => {
    if (!params.openOutfitId) return;
    if (handledOutfitId.current === params.openOutfitId) return; // ✅ skip if already handled
    if (dbOutfits.length === 0) return;

    const outfit = dbOutfits.find(
      (o) => String(o.outfitId || o.id) === String(params.openOutfitId)
    );

    if (outfit) {
      handledOutfitId.current = params.openOutfitId; // ✅ mark as handled
      openOutfitDetails(outfit.outfitId);
    }
  }, [params.openOutfitId, dbOutfits]);

  const handleToggleItems = async (value) => {
    setIsItems(value);
    await AsyncStorage.setItem("closetTab", value ? "items" : "outfits");

    // If switching to outfits, fetch them with loading indicator
    if (!value && userId) {
      setIsOutfitsLoading(true);
      try {
        await Promise.all([fetchUserOutfits(userId), fetchUserTrips(userId)]);
      } catch (error) {
        console.error("Failed to reload outfits:", error);
      } finally {
        setIsOutfitsLoading(false);
      }
    }
  };

  const handleSearchSubmit = () => setActiveSearchText(searchText);

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

  const handleShareTrip = async (trip) => {
    try {
      await Share.share({
        message: `Check out my trip to ${trip?.name} from ${trip?.dates} on StyleFinder!`,
      });
    } catch (error) {
      console.error("Failed to share trip:", error);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await apiClient.delete(`/api/trips/${tripId}`);
      setDbTrips((prev) => prev.filter((t) => t.id !== tripId));
      setIsDeleteTripModalVisible(false);
      return true;
    } catch (error) {
      console.error("Failed to delete trip:", error);
      return false;
    }
  };

  const requestDeleteTrip = (tripId) => {
    setPendingDeleteTripId(tripId);
    setIsDeleteTripModalVisible(true);
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

  const requestDeleteOutfit = (outfitId) => {
    setPendingDeleteOutfitId(outfitId);
    setIsDeleteOutfitModalVisible(true);
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

  const openOutfitDetails = (outfitId) => {
    router.push({
      pathname: "/closet/outfitsHistory/itemProperty",
      params: {
        outfitId,
        isOutfit: "true",
      },
    });
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

  const getOutfitCoverImage = (outfit) => {
    const firstOutfitItem = outfit?.outfitItems?.[0]?.item;
    return firstOutfitItem?.imageUrl || outfit?.imageUrl || null;
  };

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
        full_body: "FULL_BODY",
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

  // Uncomment when we have trip feature implemented, just want to make sure outfits are loading for now.
  // const trips = dbTrips;

  // Filter outfits by date search
  const filteredOutfits = dbOutfits.filter((outfit) => {
    if (!activeOutfitSearchText) return true;
    const query = activeOutfitSearchText.toLowerCase();
    const outfitDate = formatOutfitDate(outfit.createdAt) || "";
    return outfitDate.toLowerCase().includes(query);
  });

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

  const itemsListHeader = (
    <>
      <SearchBar
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        onSubmit={handleSearchSubmit}
      />
      <View
        className="item-categories"
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "flex-start",
          paddingVertical: 15,
        }}
      >
        <Pressable
          className="tops-category"
          style={{
            backgroundColor:
              category === "tops"
                ? theme.colors.tabIconSelected
                : theme.colors.lightBrown,
            borderRadius: 10,
            width: "48%",
            alignItems: "center",
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
            backgroundColor:
              category === "bottoms"
                ? theme.colors.tabIconSelected
                : theme.colors.lightBrown,
            borderRadius: 10,
            width: "48%",
            alignItems: "center",
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
          className="full-body-category"
          style={{
            backgroundColor:
              category === "full_body"
                ? theme.colors.tabIconSelected
                : theme.colors.lightBrown,
            borderRadius: 10,
            width: "48%",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
          onPress={() =>
            setCategory((prev) =>
              prev === "full_body" ? "all" : "full_body",
            )
          }
        >
          <ThemedText
            style={{
              color: theme.colors.text,
              fontSize: theme.sizes.text,
            }}
          >
            Full Body
          </ThemedText>
        </Pressable>

        <Pressable
          className="outerwear-category"
          style={{
            backgroundColor:
              category === "outerwear"
                ? theme.colors.tabIconSelected
                : theme.colors.lightBrown,
            borderRadius: 10,
            width: "48%",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}
          onPress={() =>
            setCategory((prev) =>
              prev === "outerwear" ? "all" : "outerwear",
            )
          }
        >
          <ThemedText
            style={{
              color: theme.colors.text,
              fontSize: theme.sizes.text,
            }}
          >
            Outerwear
          </ThemedText>
        </Pressable>
      </View>
    </>
  );

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
                    <Items
                      items={filteredItems}
                      setCurrItemId={setCurrItemId}
                      currItemId={currItemId}
                      setEditItemsModalVisible={setEditItemsModalVisible}
                      editItemsModalVisible={editItemsModalVisible}
                      listHeaderComponent={itemsListHeader}
                    />

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
                    <View style={{ width: "100%", paddingHorizontal: 30, marginTop: 15 }}>
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
                        data={filteredOutfits}
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
                          justifyContent: "center",
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
                        renderItem={({ item, index }) => (
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
                                <ThemedText
                                  style={{ fontSize: 13, fontWeight: "600" }}
                                >
                                  Outfit {index + 1}
                                </ThemedText>
                                {item.createdAt && (
                                  <ThemedText
                                    style={{ fontSize: 11, color: "#888" }}
                                  >
                                    {formatOutfitDate(item.createdAt)}
                                  </ThemedText>
                                )}
                              </View>
                              <View style={styles.outfitActions}>
                                <Pressable
                                  onPress={() => handleShareOutfit(item, index)}
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
                        )}
                      />
                    )}
                  </>
                )}

                {mode === "trip" && (
                  <>
<<<<<<< past-outfits
                    <SearchBar
                      value={tripSearchText}
                      onChangeText={(text) => {
                        setTripSearchText(text);
                      }}
                      placeholder="Search by trip location"
                      onSubmit={() => { }}
                    />
=======
                    <View style={{ width: "100%", paddingHorizontal: 30, marginTop: 15 }}>
                      <SearchBar
                        value={tripSearchText}
                        onChangeText={(text) => {
                          setTripSearchText(text);
                        }}
                        placeholder="Search by trip location"
                        onSubmit={() => { }}
                      />
                    </View>
>>>>>>> testing-everything
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
