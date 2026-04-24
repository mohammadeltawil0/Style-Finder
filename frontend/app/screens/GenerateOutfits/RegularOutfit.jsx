import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";
import OutfitCoverImage from "../../closet/outfit-cover-image";

const formatEnum = (str) => {
  if (!str) return "";
  let cleanStr = str.replace(/_OR_/g, " / ").replace(/_/g, " ");
  return cleanStr.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};

const FORMALITY_OPTIONS = [
  "CASUAL",
  "FORMAL",
  "WORK_OR_SMART",
  "PARTY_OR_NIGHT_OUT",
  "VERSATILE",
];

const ITEM_TYPE_ORDER = {
  OUTERWEAR: 1,
  OVER: 1,
  FULL_BODY: 2,
  TOP: 3,
  BOTTOM: 4,
};

const normalizeType = (type) => {
  if (!type) return "";
  const n = type
    .toString()
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  if (n.includes("OUTER")) return "OUTERWEAR";
  if (n.includes("BOTTOM")) return "BOTTOM";
  if (n.includes("FULL")) return "FULL_BODY";
  if (n.includes("TOP")) return "TOP";
  return type.toString().toUpperCase();
};

const getItemType = (item) =>
  item?.type ??
  item?.itemType ??
  item?.item?.type ??
  item?.item?.itemType ??
  "ITEM";

const getItemImageUri = (item) =>
  item?.imageUrl ??
  item?.image_url ??
  item?.item?.imageUrl ??
  item?.item?.image_url ??
  null;

const sortByTypeOrder = (items = []) =>
  [...items].sort(
    (a, b) =>
      (ITEM_TYPE_ORDER[normalizeType(getItemType(a))] || 99) -
      (ITEM_TYPE_ORDER[normalizeType(getItemType(b))] || 99),
  );

const getItemId = (item) => {
  const raw = item?.id ?? item?.itemId ?? item?.item?.id ?? item?.item?.itemId;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const fetchItemsByIds = async (itemIds = []) => {
  if (!Array.isArray(itemIds) || itemIds.length === 0) return [];
  const results = await Promise.allSettled(
    itemIds.map((id) => apiClient.get(`/api/items/${id}`)),
  );
  return sortByTypeOrder(
    results.filter((r) => r.status === "fulfilled").map((r) => r.value.data),
  );
};

/**
 * Shows the outfit's items as tappable image cards — tap one to replace it.
 * Manages its own ReplacementModal internally so no navigation is needed.
 */
const EditOutfitModal = ({
  visible,
  initialItems,
  onClose,
  onDone, // (editedItems: object[], editedItemIds: number[]) => void
  theme,
}) => {
  const [items, setItems] = useState([]);
  const [closetItems, setClosetItems] = useState([]);
  const [isLoadingCloset, setIsLoadingCloset] = useState(false);
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState(null);
  const [replaceType, setReplaceType] = useState(null);

  // Sync items when modal opens / initialItems changes
  useEffect(() => {
    if (visible && initialItems?.length) {
      setItems(initialItems);
    }
  }, [visible, initialItems]);

  // Load closet items whenever the replacement modal should open
  useEffect(() => {
    if (!replaceModalVisible) return;
    const load = async () => {
      try {
        setIsLoadingCloset(true);
        const storedId = await AsyncStorage.getItem("userId");
        if (!storedId) return;
        const userId = Number(storedId);
        if (!Number.isInteger(userId) || userId <= 0) return;
        const res = await apiClient.get(`/api/items/user/${userId}`);
        setClosetItems(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load closet items:", e);
        setClosetItems([]);
      } finally {
        setIsLoadingCloset(false);
      }
    };
    load();
  }, [replaceModalVisible]);

  const handleItemPress = (item, index) => {
    setReplaceTargetIndex(index);
    setReplaceType(normalizeType(getItemType(item)));
    setReplaceModalVisible(true);
  };

  const handleReplacement = (replacementItem) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === replaceTargetIndex ? { ...item, ...replacementItem } : item,
      ),
    );
    setReplaceModalVisible(false);
    setReplaceTargetIndex(null);
  };

  const isOuterwearItem = (item) => {
    const normalizedType = normalizeType(getItemType(item));
    return normalizedType === "OUTERWEAR" || normalizedType === "OVER";
  };

  const handleRemoveOuterwear = (indexToRemove) => {
    setItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const hasOuterwear = items.some((item) => isOuterwearItem(item));

  const handleRemoveAllOuterwear = () => {
    setItems((prev) => prev.filter((item) => !isOuterwearItem(item)));
  };

  const handleDone = () => {
    const ids = items.map(getItemId).filter((id) => id !== null);
    if (ids.length === 0) {
      Alert.alert(
        "No Valid Items",
        "Please keep at least one valid outfit item.",
      );
      return;
    }
    onDone(items, ids);
  };

  const filteredCloset = closetItems.filter(
    (item) => normalizeType(getItemType(item)) === replaceType,
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {!replaceModalVisible ? (
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
              <ThemedText style={styles.modalTitle}>Edit Outfit</ThemedText>
              <ThemedText style={styles.editSubtitle}>
                Tap image to replace, tap trash to remove outerwear.
              </ThemedText>

              {items.length === 0 && (
                <ThemedText style={styles.emptyText}>
                  No outfit items are available to edit.
                </ThemedText>
              )}

              {items.map((item, index) => (
                <TouchableOpacity
                  key={`${getItemId(item) ?? index}-${getItemType(item)}`}
                  style={[
                    styles.editItemCard,
                    { backgroundColor: theme.colors.card },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleItemPress(item, index)}
                >
                  {getItemImageUri(item) ? (
                    <Image
                      source={{ uri: getItemImageUri(item) }}
                      style={styles.editItemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.editItemImage, styles.noImage]}>
                      <ThemedText style={{ color: "#aaa" }}>
                        No image
                      </ThemedText>
                    </View>
                  )}

                  {isOuterwearItem(item) && (
                    <Pressable
                      style={styles.trashIconOverlay}
                      onPress={() => handleRemoveOuterwear(index)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={19}
                        color={theme.colors.text}
                      />
                    </Pressable>
                  )}

                  <View style={{ marginTop: 10 }}>
                    <ThemedText style={{ fontWeight: "bold", fontSize: 17 }}>
                      {formatEnum(getItemType(item))}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 13, opacity: 0.6 }}>
                      Tap to replace this item
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}


              <TouchableOpacity
                style={[
                  styles.generateBtn,
                  {
                    backgroundColor: theme.colors.tabIconSelected,
                    opacity: items.length === 0 ? 0.7 : 1,
                    marginTop: 12,
                  },
                ]}
                disabled={items.length === 0}
                onPress={handleDone}
              >
                <Text style={styles.generateBtnText}>Done Editing</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.modalTitle}>
                Replace {formatEnum(replaceType)}
              </ThemedText>
              {isLoadingCloset ? (
                <ActivityIndicator size="large" color={theme.colors.text} />
              ) : filteredCloset.length === 0 ? (
                <ThemedText style={styles.emptyText}>
                  No matching {formatEnum(replaceType).toLowerCase()} items in
                  your closet.
                </ThemedText>
              ) : (
                <FlatList
                  data={filteredCloset}
                  keyExtractor={(item, idx) =>
                    getItemId(item) != null
                      ? String(getItemId(item))
                      : `r-${idx}`
                  }
                  numColumns={2}
                  columnWrapperStyle={{ justifyContent: "space-between" }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.outfitCard,
                        { backgroundColor: theme.colors.lightBrown },
                      ]}
                      onPress={() => handleReplacement(item)}
                      activeOpacity={0.8}
                    >
                      {getItemImageUri(item) ? (
                        <Image
                          source={{ uri: getItemImageUri(item) }}
                          style={styles.replacementImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.replacementImage, styles.noImage]}>
                          <ThemedText style={{ fontSize: 12, color: "#aaa" }}>
                            No image
                          </ThemedText>
                        </View>
                      )}
                      <View
                        style={[
                          styles.cardFooter,
                          { backgroundColor: theme.colors.card },
                        ]}
                      >
                        <ThemedText>{formatEnum(getItemType(item))}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}

              <TouchableOpacity
                style={[
                  styles.generateBtn,
                  { backgroundColor: theme.colors.card },
                ]}
                onPress={() => {
                  setReplaceModalVisible(false);
                  setReplaceTargetIndex(null);
                }}
              >
                <Text
                  style={[styles.generateBtnText, { color: theme.colors.text }]}
                >
                  Back to Edit
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};



// ─── Outfit Details Modal ─────────────────────────────────────────────────────

const OutfitDetailsModal = ({
  visible,
  outfit,
  editedItems,
  onClose,
  onAction,
  onOpenEdit,
  theme,
}) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;

    if (Array.isArray(editedItems) && editedItems.length > 0) {
      setItems(editedItems);
      setIsLoading(false);
      return;
    }

    if (!outfit?.itemIds) return;

    const load = async () => {
      try {
        setIsLoading(true);
        setItems(await fetchItemsByIds(outfit.itemIds));
      } catch (e) {
        console.error("Failed to load outfit items:", e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [visible, outfit, editedItems]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.chevronView}>
          <Pressable onPress={onClose}>
            <Entypo name="chevron-down" size={30} color={theme.colors.text} />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.text} />
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <ThemedText style={styles.modalTitle}>Outfit Details</ThemedText>

            {items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.responseContainer,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontWeight: "bold", fontSize: 18 }}>
                    {formatEnum(getItemType(item))}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14, marginBottom: 10 }}>
                    A {item.color?.toLowerCase()} {formatEnum(item.fit)} fit{" "}
                    {formatEnum(getItemType(item)).toLowerCase()}.
                  </ThemedText>
                  {getItemImageUri(item) ? (
                    <Image
                      source={{ uri: getItemImageUri(item) }}
                      style={styles.itemImagePlaceholder}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.itemImagePlaceholder, styles.noImage]}>
                      <ThemedText style={{ color: "#aaa" }}>
                        No image
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#b49480" }]}
                onPress={() => onAction("SAVE")}
              >
                <Text style={styles.actionBtnText}>Save Outfit</Text>
              </TouchableOpacity>

              {/* Edit feedback only; save stays separate. */}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#e2d7cd" }]}
                onPress={() => onOpenEdit(items)}
              >
                <Text style={[styles.actionBtnText, { color: "#000" }]}>
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#ff4444" }]}
                onPress={() => onAction("REJECT")}
              >
                <Text style={styles.actionBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function RegularOutfit() {
  const theme = useTheme();

  const [suggestions, setSuggestions] = useState([]);
  const [formality, setFormality] = useState("CASUAL");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useMemory, setUseMemory] = useState(false);
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [eventType, setEventType] = useState("");

  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState(null); // Stores the final lat,lon for the payload
  const [searchResults, setSearchResults] = useState([]); // Stores the Open-Meteo array
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false); // For location autocomplete dropdown

  // Modal state
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editableItems, setEditableItems] = useState([]);
  const [editedItemIds, setEditedItemIds] = useState(null);

  // Additional constraints
  const [topFit, setTopFit] = useState([]);
  const [topLength, setTopLength] = useState([]);
  const [bottomFit, setBottomFit] = useState([]);
  const [bottomLength, setBottomLength] = useState([]);
  const [fullBody, setFullBody] = useState(false);
  const [fullBodyLength, setFullBodyLength] = useState([]);
  const [outerwear, setOuterwear] = useState(false);
  const [outerFit, setOuterFit] = useState([]);
  const [patterns, setPatterns] = useState(false);
  const [color, setColor] = useState("");
  const [extraConstraints, setConstraints] = useState(null);

  const predefinedLocations = [
    { city: "New York", state: "NY", country: "USA" },
    { city: "New Brunswick", state: "NJ", country: "USA" },
    { city: "Piscataway", state: "NJ", country: "USA" },
    { city: "Jersey City", state: "NJ", country: "USA" },
    { city: "Los Angeles", state: "CA", country: "USA" },
    { city: "Chicago", state: "IL", country: "USA" },
    { city: "Houston", state: "TX", country: "USA" },
    { city: "Miami", state: "FL", country: "USA" },
  ];

  const filteredLocations = predefinedLocations.filter((l) =>
    `${l.city}, ${l.state}, ${l.country}`
      .toLowerCase()
      .includes(location.toLowerCase()),
  );

  // Helper function to get userId from AsyncStorage
  const getUserId = async () => {
    try {
      const storedIdString = await AsyncStorage.getItem("userId");
      if (storedIdString !== null) return parseInt(storedIdString, 10);
    } catch (error) {
      console.error("Storage error", error);
    }
    return null;
  };

  // --- Open-Meteo Geocoding Search ---
  const handleLocationSearch = async (text) => {
    setLocation(text);
    setLocationCoords(null); // Reset coords if they start typing again

    if (text.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearchingLocation(true);
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(text)}&count=5&language=en&format=json`,
      );
      const data = await res.json();

      if (data.results) {
        setSearchResults(data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Allow location access to use this feature.",
        );
        return;
      }

      // 1. Instantly close dropdown and show loading text in the search bar
      setShowDropdown(false);
      setLocation("Locating...");

      // 2. Fetch coords (Using Balanced accuracy prevents hanging on Android/Emulators)
      const gps = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // 3. Reverse geocode to get City, State, Country
      const geocode = await Location.reverseGeocodeAsync({
        latitude: gps.coords.latitude,
        longitude: gps.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const place = geocode;
        const city = place.city || place.subregion || place.district || "";
        const state = place.region || "";
        const country = place.country || "";

        // Filter out empty strings and join with commas
        const formattedLocation = [city, state, country]
          .filter(Boolean)
          .join(", ");

        // 4. If we successfully got a name, use it. Otherwise, fallback to coordinates!
        if (formattedLocation.trim() !== "") {
          setLocation(formattedLocation);
        } else {
          const coordString = `${gps.coords.latitude},${gps.coords.longitude}`;
          setLocationCoords(coordString); // Save exact coords for payload
          setLocation(
            formattedLocation.trim() !== "" ? formattedLocation : coordString,
          ); // Display readable name
        }
      } else {
        // Fallback if the geocoder completely fails to return an array
        const coordString = `${gps.coords.latitude},${gps.coords.longitude}`;
        setLocationCoords(coordString); // Save exact coords for payload
        setLocation(
          formattedLocation.trim() !== "" ? formattedLocation : coordString,
        ); // Display readable name
      }
    } catch (error) {
      console.error("Location error:", error);
      setLocation(""); // Clear the "Locating..." text if it crashes
      Alert.alert(
        "Error",
        "Could not fetch current location. Please try typing it manually.",
      );
    }
  };

  // On screen focus, load any saved constraints from AsyncStorage (if user navigated back from different screen)
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const saved = await AsyncStorage.getItem("recommendationConstraints");
        if (saved) {
          const parsed = JSON.parse(saved);
          setLocation(parsed.location || "");
          setFormality(parsed.formality || "CASUAL");
          setEventType(parsed.eventType || "");
          setWeatherEnabled(
            parsed.weatherEnabled === true || parsed.weatherEnabled === "true",
          );
          setConstraints(parsed);
        }
      };
      load();
    }, []),
  );

  // Restore saved constraints on focus
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const saved = await AsyncStorage.getItem("recommendationConstraints");
        if (!saved) return;
        const p = JSON.parse(saved);
        setLocation(p.location || "");
        setFormality(p.formality || "CASUAL");
        setEventType(p.eventType || "");
        setWeatherEnabled(
          p.weatherEnabled === true || p.weatherEnabled === "true",
        );
        setConstraints(p);
        setTopFit(p.topFit || []);
        setTopLength(p.topLength || []);
        setBottomFit(p.bottomFit || []);
        setBottomLength(p.bottomLength || []);
        setFullBody(p.fullBody || false);
        setFullBodyLength(p.fullBodyLength || []);
        setOuterwear(p.outerwear || false);
        setOuterFit(p.outerFit || []);
        setPatterns(p.patterns || false);
        setColor(p.color || "");
      };
      load();
    }, []),
  );

  const handleGenerateOutfit = async () => {
    if (!locationCoords || !formality) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Location and Occasion are required.",
      });
      return;
    }

    try {
      const userId = await getUserId();
      const itemsRes = await apiClient.get(`/api/items/user/${userId}`);
      const userItems = Array.isArray(itemsRes.data) ? itemsRes.data : [];

      const tops = userItems.filter(item => normalizeType(getItemType(item)) === "TOP");
      const bottoms = userItems.filter(item => normalizeType(getItemType(item)) === "BOTTOM");

      if (tops.length < 2 || bottoms.length < 2) {
        Toast.show({
          type: "error",
          text1: "Not enough items",
          text2: `You need at least 2 tops and 2 bottoms.`,
          text3: `You have ${tops.length} top(s) and ${bottoms.length} bottom(s).`,

        });
        return;
      }
    } catch (e) {
      if (e?.response?.status !== 500) {
        console.error("Generate outfit error:", e);
      }
      Toast.show({
        type: "error",
        text1: "Could not load closet",
        text2: "Please try again.",
      });
      return;
    }


    try {
      setIsGenerating(true);

      // Get GPS coords for weather
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location is required for weather-based outfits.",
        );
        setIsGenerating(false);
        return;
      }
      const finalLocation = locationCoords || location;
      const userId = await getUserId();

      const data = {
        location: finalLocation,
        event: formality,
        useMemory,
        // Additional fields
        manualLocation: location,
        eventType,
        weatherEnabled,
      };
      setShowDropdown(false);

      console.log("=== Generate Outfit Request ===");
      console.log("UserId:", userId);
      console.log("Payload:", JSON.stringify(data, null, 2));

      const res = await apiClient.post(
        `/api/v1/suggestions/hub/${userId}`,
        data,
      );

      console.log("=== Generate Outfit Response ===");
      console.log("Response:", JSON.stringify(res.data, null, 2));

      setSuggestions(res.data?.slice(0, 10) || []);
      Toast.show({
        type: "success",
        text1: "Outfit generated",
        text2: "Scroll down to see your outfits.",
      });
    } catch (e) {
      console.error("Generate outfit error:", e);
      Toast.show({
        type: "error",
        text1: "Outfit generation failed",
        text2: "Try again in a few minutes.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Unified feedback sender
  const sendFeedback = async (actionType, finalItemIds = null) => {
    if (!selectedOutfit) return;
    const userId = await getUserId();
    await apiClient.post(`/api/v1/suggestions/feedback`, {
      userId,
      suggestionId: selectedOutfit.suggestionId,
      originalItemIds: selectedOutfit.itemIds,
      finalItemIds: finalItemIds || selectedOutfit.itemIds,
      action: actionType,
      contextTemp: 72,
      contextOccasion: formality || "Casual",
    });
  };

  const handleAction = async (actionType) => {
    try {
      const idsToSave = editedItemIds ?? selectedOutfit.itemIds;
      await sendFeedback(actionType, idsToSave);
    } catch (e) {
      if (e?.response?.status !== 409) {
        console.error("Feedback error:", e);
        Toast.show({
          type: "error",
          text1: "Action failed",
          text2: "Please try again.",
        });
        return;
      }
    }
    // Remove outfit from grid and close modals
    setSuggestions((prev) =>
      prev.filter((o) => o.suggestionId !== selectedOutfit.suggestionId),
    );
    setIsDetailsModalVisible(false);
    setIsEditModalVisible(false);
    setSelectedOutfit(null);
    setEditedItemIds(null);

    if (actionType === "SAVE") {
      Toast.show({
        type: "success",
        text1: "Outfit saved",
      });
    } else if (actionType === "REJECT") {
      Toast.show({
        type: "error",
        text1: "Rejected",
      });
    }
  };

  // Called from OutfitDetailsModal when user taps "Edit"
  const handleOpenEdit = (prefetchedItems) => {
    setEditableItems(prefetchedItems);
    setIsDetailsModalVisible(false); // close details sheet
    // Small delay so the first sheet fully dismisses before the next appears
    setTimeout(() => setIsEditModalVisible(true), 500);
  };

  // Called from EditOutfitModal when user taps "Done Editing" (feedback-only)
  const handleDoneEditing = (finalEditedItems, finalEditedItemIds) => {
    setEditableItems(finalEditedItems);
    setEditedItemIds(finalEditedItemIds);
    setIsEditModalVisible(false);
    setTimeout(() => setIsDetailsModalVisible(true), 250);

    sendFeedback("EDIT_FEEDBACK", finalEditedItemIds).catch((e) => {
      console.error("Edit feedback error:", e);
      Toast.show({
        type: "error",
        text1: "Feedback failed",
        text2: "Please try again.",
      });
    });
    Toast.show({
      type: "info",
      text1: "Feedback sent",
      text2: "You can still save the original outfit.",
    });
  };

  const buttonText = isGenerating
    ? "Processing..."
    : useMemory
      ? "Recall Outfits"
      : "Generate Outfit";

  return (
    <View>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText
            style={[
              styles.headerTitle,
              { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h1 },
            ]}
          >
            Let's find{"\n"}your style!
          </ThemedText>
        </View>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
      </View>

      {/* ── Controls ── */}
      <View style={[styles.controlsContainer, {
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 3.5,
        elevation: 5
      }]}>
        <ThemedText style={styles.sectionLabel}>Select Occasion:</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          {FORMALITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => {
                setFormality(opt);
                if (opt !== "FORMAL") setEventType("");
              }}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    formality === opt
                      ? theme.colors.tabIconSelected
                      : theme.colors.card,
                },
              ]}
            >
              <Text
                style={{
                  color: formality === opt ? "#fff" : theme.colors.text,
                  fontSize: 14,
                }}
              >
                {formatEnum(opt)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {formality === "FORMAL" && (
          <View style={{ marginBottom: 20 }}>
            <ThemedText style={styles.sectionLabel}>Event Type:</ThemedText>
            <TextInput
              placeholder="e.g. Wedding, Gala, Interview..."
              placeholderTextColor="#aaa"
              value={eventType}
              onChangeText={setEventType}
              style={[styles.input, { color: theme.colors.text }]}
            />
          </View>
        )}
        {/* Location */}
        <ThemedText style={styles.sectionLabel}>Location:</ThemedText>
        <TextInput
          placeholder="Search city, state, or country..."
          placeholderTextColor="#aaa"
          value={location}
          onFocus={() => setShowDropdown(true)}
          onChangeText={(text) => {
            handleLocationSearch(text);
            setShowDropdown(true);
          }}
          style={[styles.input, { color: theme.colors.text, marginBottom: 4 }]}
        />

        {showDropdown && (
          <ScrollView
            style={styles.filterList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                { backgroundColor: theme.colors.card },
              ]}
              onPress={handleCurrentLocation}
            >
              <ThemedText
                style={{
                  fontWeight: "bold",
                  color: theme.colors.tabIconSelected,
                }}
              >
                📍 Use Current Location
              </ThemedText>
            </TouchableOpacity>

            {isSearchingLocation && (
              <View style={{ padding: 10 }}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.tabIconSelected}
                />
              </View>
            )}

            {/* Dynamic Open-Meteo Results */}
            {!isSearchingLocation &&
              searchResults.map((place) => {
                // Format: "City, State, Country"
                const displayName = [place.name, place.admin1, place.country]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setLocation(displayName);
                      setLocationCoords(`${place.latitude},${place.longitude}`);
                      setShowDropdown(false);
                    }}
                  >
                    <ThemedText>{displayName}</ThemedText>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        )}

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <ThemedText style={styles.toggleLabel}>Consider Weather:</ThemedText>
          <Switch
            trackColor={{
              false: "#767577",
              true: theme.colors.tabIconSelected,
            }}
            thumbColor="#f4f3f4"
            onValueChange={setWeatherEnabled}
            value={weatherEnabled}
          />
        </View>

        <View style={styles.toggleRow}>
          <ThemedText style={styles.toggleLabel}>
            Recall past outfits?
          </ThemedText>
          <Switch
            trackColor={{
              false: "#767577",
              true: theme.colors.tabIconSelected,
            }}
            thumbColor="#f4f3f4"
            onValueChange={setUseMemory}
            value={useMemory}
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={handleGenerateOutfit}
          activeOpacity={0.7}
          disabled={isGenerating}
          style={[
            styles.generateBtn,
            { backgroundColor: theme.colors.tabIconSelected },
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateBtnText}>{buttonText}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Results Grid ── */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) =>
            item?.suggestionId != null
              ? String(item.suggestionId)
              : `suggestion-${index}`
          }
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 30, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.outfitCard,
                { backgroundColor: theme.colors.lightBrown },
              ]}
              onPress={() => {
                setSelectedOutfit(item);
                setEditableItems([]);
                setEditedItemIds(null);
                setIsDetailsModalVisible(true);
              }}
            >
              <OutfitCoverImage itemIds={item.itemIds || []} height={120} />
              <View
                style={[
                  styles.cardFooter,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                <ThemedText>Score: {item.score?.toFixed(1)}</ThemedText>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── Outfit Details Modal ── */}
      <OutfitDetailsModal
        visible={isDetailsModalVisible}
        outfit={selectedOutfit}
        editedItems={editableItems}
        onClose={() => {
          setIsDetailsModalVisible(false);
          setEditableItems([]);
        }}
        onAction={handleAction}
        onOpenEdit={handleOpenEdit}
        theme={theme}
      />

      {/* ── Edit Outfit Modal (self-contained with replacement sheet inside) ── */}
      <EditOutfitModal
        visible={isEditModalVisible}
        initialItems={editableItems}
        onClose={() => {
          setIsEditModalVisible(false);
          setEditableItems([]);
        }}
        onDone={handleDoneEditing}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    margin: 30,
    paddingHorizontal: 10,
  },
  headerTitle: { lineHeight: 40 },
  logo: { width: 80, height: 80, borderRadius: 12 },
  controlsContainer: {
    margin: 30,
    marginTop: 0,
    padding: 18,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
  },
  sectionLabel: {
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    backgroundColor: "#cac4c440",
    borderWidth: 1,
    borderColor: "#cac4c4b9",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  filterList: {
    maxHeight: 130,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 14,
    borderRadius: 1,
    marginBottom: 40,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  toggleLabel: { fontSize: 15, fontWeight: "500" },
  generateBtn: { padding: 15, borderRadius: 12, alignItems: "center" },
  generateBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  outfitCard: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 20,
    maxWidth: "48%",
    overflow: "hidden",
  },
  cardFooter: { padding: 10 },
  // Modals
  modalContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  chevronView: { alignItems: "flex-end", marginBottom: 10 },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  editSubtitle: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  emptyText: { textAlign: "center", color: "#777", marginVertical: 20 },
  responseContainer: { padding: 15, borderRadius: 10, marginBottom: 15 },
  itemImagePlaceholder: { height: 180, borderRadius: 10, marginTop: 5 },
  modalActions: { marginTop: 20, gap: 10 },
  actionBtn: { padding: 15, borderRadius: 10, alignItems: "center" },
  actionBtnText: { color: "#fff", fontWeight: "bold" },
  // Edit modal item cards
  editItemCard: { padding: 12, borderRadius: 10, marginBottom: 14 },
  editItemImage: { width: "100%", height: 180, borderRadius: 10 },
  trashIconOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 6,
    padding: 6,
    zIndex: 10,
  },
  noImage: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
  },
  // Replacement modal grid
  replacementImage: { width: "100%", height: 150 },
});
