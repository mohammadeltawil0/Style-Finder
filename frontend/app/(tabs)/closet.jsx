import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import {
  ClosetToggle,
  Items,
  SearchBar,
  ThemedText,
  ThemedView,
} from "../../components";
import { apiClient } from "../../scripts/apiClient";
import OutfitCoverImage from "../closet/outfit-cover-image";
import OutfitDetailsModal from "../closet/outfit-details-modal";

export default function ClosetScreen() {
  const [isItems, setIsItems] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [activeSearchText, setActiveSearchText] = useState("");
  const [outfitSearchText, setOutfitSearchText] = useState("");
  const [activeOutfitSearchText, setActiveOutfitSearchText] = useState("");
  const [tripSearchText, setTripSearchText] = useState("");
  const [category, setCategory] = useState("all");
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

  const fetchUserTrips = async (id) => {
    try {
      const response = await apiClient.get(`/api/trips/user/${id}`);
      if (response.status === 200) {
        const formattedTrips = response.data.map((trip) => {
          const allOutfits = (trip.days || []).flatMap(
            (day) => day.outfits || [],
          );
          return {
            id: trip.tripId?.toString(),
            name: trip.tripLocation || "Trip",
            location: trip.tripLocation || "",
            dates:
              trip.startDate && trip.endDate
                ? `${trip.startDate} - ${trip.endDate}`
                : "",
            outfits: allOutfits, // Assign the flattened outfits here!
          };
        });
        setDbTrips(formattedTrips);
      }
    } catch (error) {
      console.error("Failed to fetch trips:", error);
    }
  };

  const normalizeId = (value) => (value == null ? null : String(value));

  useFocusEffect(
    useCallback(() => {
      const loadTabStateAndData = async () => {
        try {
          setIsLoading(true);
          const userIdStr = await AsyncStorage.getItem("userId");
          const parsedId = userIdStr ? parseInt(userIdStr, 10) : null;

          // If we have an openOutfitId param, force outfits tab
          if (params.openOutfitId) {
            setIsItems(false);
            await AsyncStorage.setItem("closetTab", "outfits");
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
      const deletedId = normalizeId(outfitId);
      setDbOutfits((prev) =>
        prev.filter(
          (o) =>
            normalizeId(o.outfitId) !== deletedId &&
            normalizeId(o.id) !== deletedId,
        ),
      );
      if (userId) {
        await fetchUserOutfits(userId);
      }
      setIsOutfitModalVisible(false);
      return true;
    } catch (error) {
      console.error("Failed to delete outfit:", error);
      return false;
    }
  };

  const handleShareOutfit = async (outfit, index) => {
    try {
      const itemCount = outfit?.itemIds?.length || 0;
      const res = await apiClient.post(`/api/share/${outfit.outfitId}`);
      const link = res.data.shareLink;
      await Share.share({
        message: `Check out Outfit ${index + 1} from my closet on StyleFinder (${itemCount} item${itemCount === 1 ? "" : "s"})!\n\n${link}`,
      });
      console.log("Outfit shared successfully:", link);
    } catch (error) {
      console.error("Failed to share outfit:", error);
    }
  };

  const handleShareTrip = async (trip) => {
    try {
      const tripId = trip.id;
      const res = await apiClient.post(`/api/share/trip/${tripId}`);
      const link = res.data.shareLink;
      const result = await Share.share({
        message: `Check out my trip to ${trip.tripLocation || "this destination"} on StyleFinder!\n\n${link}`,
      });
      if (result.action === Share.sharedAction) {
        console.log("Trip shared successfully:", link);
      } else {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Failed to share trip:", error);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await apiClient.delete(`/api/trips/${tripId}`);
      const deletedId = normalizeId(tripId);
      setDbTrips((prev) => prev.filter((t) => normalizeId(t.id) !== deletedId));
      if (userId) {
        await fetchUserTrips(userId);
      }
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

  const openItemDetails = async (itemId) => {
    router.push({
      pathname: `/closet/item-details-modal`,
      params: {
        itemId,
        returnTab: "items",
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

  const normalize = (text) => text?.toString().toLowerCase().replace(/_/g, " "); //normalize helper

  const materialMap = {
    COTTON: "cotton",
    LINEN: "linen hemp",
    WOOL: "wool",
    SILK: "silk satin",
    LEATHER: "leather faux",
    POLYESTER: "synthetics polyester",
    DENIM: "denim",
    KNIT: "knit jersey",
    FLEECE: "fleece",
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

  const lengthMap = {
    SLEEVELESS: "sleeveless",
    CAP: "cap sleeve",
    SHORT_SLEEVE: "short sleeve",
    THREE_QUARTER: "three quarter sleeve",
    LONG_SLEEVE: "long sleeve",
    ABOVE_KNEE: "above knee mini micro shorts",
    KNEE_LENGTH_OR_BERMUDA: "knee length bermuda",
    MIDI_OR_CAPRI: "midi capri",
    MAXI_OR_FULL_LENGTH: "maxi full length",
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
        item.seasonWear === "ALL_SEASONS" ? "summer winter spring fall" : null,
        normalize(item.formality),
        normalize(item.fit),
        normalize(item.pattern),

        materialMap[item.material],
        patternMap[item.pattern],
        eventMap[item.formality],
        fitMap[item.fit],
        lengthMap[item.length],
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
  const trips = dbTrips;

  // Filter outfits by date search, then show newest outfits first.
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

  const categories = ["all", "tops", "bottoms", "full_body", "outerwear"];

  const itemsListHeader = (
    <>
      <SearchBar
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        placeholder={
          "Search Item via Type, Formality, Season, Material, Pattern, "
        }
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
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={{
              backgroundColor:
                category === cat
                  ? theme.colors.tabIconSelected
                  : theme.colors.lightBrown,
              borderRadius: 10,
              width: "30%",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 10,
            }}
            onPress={() => setCategory((prev) => (prev === cat ? "all" : cat))}
          >
            <ThemedText
              style={{ color: theme.colors.text, fontSize: theme.sizes.text }}
            >
              {cat === "all"
                ? "All"
                : cat === "full_body"
                  ? "Full Body"
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </>
  );

  return (
    <ThemedView gradient={false} style={{ flex: 1, alignItems: "center" }}>
      <ClosetToggle isItems={isItems} toggleItems={handleToggleItems} />

      <View
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          position: "relative",
        }}
      >
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
                    {itemsError?.message ||
                      "Could not load items. Please try again."}
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
                    openItemDetails={openItemDetails}
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
                              <OutfitCoverImage
                                imageUrls={getOutfitCoverImages(item)}
                                itemIds={item.itemIds || []}
                                height={175}
                              />
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
                    keyExtractor={(trip, index) => trip.id || index.toString()}
                    style={{
                      marginVertical: 15,
                      paddingHorizontal: 15,
                      width: "100%",
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
                          No saved trip outfits yet.
                        </ThemedText>
                      )
                    }
                    renderItem={({ item, index }) => (
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
                              <ThemedText
                                style={{ fontSize: 18, fontWeight: "bold" }}
                              >
                                {" "}
                                {item.name}{" "}
                              </ThemedText>
                              <ThemedText style={{ color: "#555" }}>
                                {item.dates}
                              </ThemedText>
                              <ThemedText
                                style={{ fontStyle: "italic", color: "#888" }}
                              >
                                # Trip
                              </ThemedText>
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
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                              gap: 10,
                              paddingVertical: 10,
                            }}
                          >
                            {(item.outfits || []).map((outfit, index) => (
                              <View
                                key={outfit.suggestionId || index}
                                style={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: 10,
                                  overflow: "hidden",
                                }}
                              >
                                <OutfitCoverImage
                                  itemIds={outfit.itemIds || []}
                                  height={100}
                                />
                              </View>
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
                      This action cannot be undone. This outfit will be removed
                      permanently.
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
