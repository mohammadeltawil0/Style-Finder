import Entypo from "@expo/vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";
import OutfitCoverImage from "../../closet/outfit-cover-image";
import Toast from "react-native-toast-message";


const formatEnum = (str) => {
  if (!str) return "";
  let cleanStr = str.replace(/_OR_/g, " / ").replace(/_/g, " ");
  return cleanStr.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};

const formatDateDisplay = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
const toISO = (date) => date.toISOString().split("T")[0];
// Generate array of Date objects between start and end inclusive
const getDateRange = (start, end) => {
  const dates = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// date picker
const InlineDatePicker = ({ label, date, onChange, theme }) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(date.getMonth());
  const [day, setDay] = useState(date.getDate());
  const [year, setYear] = useState(date.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, daysInMonth);

  const handleConfirm = () => {
    const confirmed = new Date(year, month, safeDay);
    confirmed.setHours(0, 0, 0, 0);
    onChange(confirmed);
    setOpen(false);
  };

  return (
    <View style={{ marginBottom: 12 }}>
      <TouchableOpacity
        style={[
          styles.dateSelectBtn,
          { backgroundColor: theme.colors.card, borderColor: "#ddd" },
        ]}
        onPress={() => setOpen((o) => !o)}
      >
        <Entypo name="calendar" size={16} color={theme.colors.text} />
        <ThemedText style={{ fontSize: 14, marginLeft: 8 }}>
          {label}:{" "}
          <Text style={{ fontWeight: "bold" }}>
            {formatDateDisplay(new Date(year, month, safeDay))}
          </Text>
        </ThemedText>
        <Entypo
          name={open ? "chevron-up" : "chevron-down"}
          size={16}
          color={theme.colors.text}
          style={{ marginLeft: "auto" }}
        />
      </TouchableOpacity>

      {open && (
        <View
          style={[styles.pickerBox, { backgroundColor: theme.colors.card }]}
        >
          <View style={styles.pickerRow}>
            {/* Month */}
            <View style={styles.pickerCol}>
              <ThemedText style={styles.pickerColLabel}>Month</ThemedText>
              <TouchableOpacity
                onPress={() => setMonth((m) => (m === 0 ? 11 : m - 1))}
              >
                <Entypo name="chevron-up" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <ThemedText style={styles.pickerVal}>{MONTHS[month]}</ThemedText>
              <TouchableOpacity
                onPress={() => setMonth((m) => (m === 11 ? 0 : m + 1))}
              >
                <Entypo
                  name="chevron-down"
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Day */}
            <View style={styles.pickerCol}>
              <ThemedText style={styles.pickerColLabel}>Day</ThemedText>
              <TouchableOpacity
                onPress={() => setDay((d) => (d <= 1 ? daysInMonth : d - 1))}
              >
                <Entypo name="chevron-up" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <ThemedText style={styles.pickerVal}>
                {String(safeDay).padStart(2, "0")}
              </ThemedText>
              <TouchableOpacity
                onPress={() => setDay((d) => (d >= daysInMonth ? 1 : d + 1))}
              >
                <Entypo
                  name="chevron-down"
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Year */}
            <View style={styles.pickerCol}>
              <ThemedText style={styles.pickerColLabel}>Year</ThemedText>
              <TouchableOpacity onPress={() => setYear((y) => y - 1)}>
                <Entypo name="chevron-up" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <ThemedText style={styles.pickerVal}>{year}</ThemedText>
              <TouchableOpacity onPress={() => setYear((y) => y + 1)}>
                <Entypo
                  name="chevron-down"
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.pickerActions}>
            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={styles.pickerCancel}
            >
              <Text style={{ color: "#aaa", fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.pickerConfirm,
                { backgroundColor: theme.colors.tabIconSelected },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const FORMALITY_OPTIONS = [
  "CASUAL",
  "FORMAL",
  "WORK_OR_SMART",
  "PARTY_OR_NIGHT_OUT",
  "VERSATILE",
];
const WEATHER_OPTIONS = [
  "SUNNY",
  "CLOUDY",
  "RAINY",
  "SNOWY",
  "WINDY",
  "HOT",
  "COLD",
];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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
  const normalized = type
    .toString()
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  if (normalized.includes("OUTER")) return "OUTERWEAR";
  if (normalized.includes("BOTTOM")) return "BOTTOM";
  if (normalized.includes("FULL")) return "FULL_BODY";
  if (normalized.includes("TOP")) return "TOP";
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

const getItemId = (item) => {
  const raw = item?.id ?? item?.itemId ?? item?.item?.id ?? item?.item?.itemId;
  if (raw == null) return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const sortByTypeOrder = (items = []) =>
  [...items].sort(
    (a, b) =>
      (ITEM_TYPE_ORDER[normalizeType(getItemType(a))] || 99) -
      (ITEM_TYPE_ORDER[normalizeType(getItemType(b))] || 99),
  );

const fetchItemsByIds = async (itemIds = []) => {
  if (!Array.isArray(itemIds) || itemIds.length === 0) return [];
  const results = await Promise.allSettled(
    itemIds.map((id) => apiClient.get(`/api/items/${id}`)),
  );
  return sortByTypeOrder(
    results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value.data),
  );
};

const EditOutfitModal = ({ visible, initialItems, onClose, onDone, theme }) => {
  const [items, setItems] = useState([]);
  const [closetItems, setClosetItems] = useState([]);
  const [isLoadingCloset, setIsLoadingCloset] = useState(false);
  const [replaceModalVisible, setReplaceModalVisible] = useState(false);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState(null);
  const [replaceType, setReplaceType] = useState(null);

  useEffect(() => {
    if (visible && Array.isArray(initialItems)) {
      setItems(initialItems);
    }
  }, [visible, initialItems]);

  useEffect(() => {
    if (!replaceModalVisible) return;

    const loadClosetItems = async () => {
      try {
        setIsLoadingCloset(true);
        const storedId = await AsyncStorage.getItem("userId");
        if (!storedId) return;

        const userId = Number(storedId);
        if (!Number.isInteger(userId) || userId <= 0) return;

        const res = await apiClient.get(`/api/items/user/${userId}`);
        setClosetItems(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load closet items:", error);
        setClosetItems([]);
      } finally {
        setIsLoadingCloset(false);
      }
    };

    loadClosetItems();
  }, [replaceModalVisible]);

  const handleItemPress = (item, index) => {
    setReplaceTargetIndex(index);
    setReplaceType(normalizeType(getItemType(item)));
    setReplaceModalVisible(true);
  };

  const handleReplacement = (replacementItem) => {
    setItems((prev) =>
      prev.map((item, index) =>
        index === replaceTargetIndex ? { ...item, ...replacementItem } : item,
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
    setItems((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleDone = () => {
    const ids = items.map(getItemId).filter((id) => id !== null);
    if (ids.length === 0) {
      Toast.show({
        type: "error",
        text1: "No Valid Items",
        text2: "Please keep at least one valid outfit item.",
      });
      return;
    }

    onDone(items, ids);
  };

  const filteredCloset = closetItems.filter(
    (item) => normalizeType(getItemType(item)) === replaceType,
  );

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
        {!replaceModalVisible ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            <ThemedText style={styles.modalTitle}>Edit Outfit</ThemedText>
            <ThemedText style={styles.editSubtitle}>
              Tap an item to replace it with a closet item.
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
                    <ThemedText style={{ color: "#aaa" }}>No image</ThemedText>
                  </View>
                )}

                {isOuterwearItem(item) && (
                  <Pressable
                    style={styles.trashIconOverlay}
                    onPress={() => handleRemoveOuterwear(index)}
                    hitSlop={8}
                  >
                    <Entypo name="trash" size={18} color={theme.colors.text} />
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
                keyExtractor={(item, index) =>
                  getItemId(item) != null
                    ? String(getItemId(item))
                    : `replace-${index}`
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
  );
};

const TripReviewModal = ({
  visible,
  days,
  onClose,
  onOpenDetails,
  onSaveTrip,
  isSaving,
  theme,
}) => {
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

        <ThemedText style={styles.modalTitle}>Review Trip Outfits</ThemedText>
        <ThemedText style={styles.editSubtitle}>
          Edit any outfit before saving the trip to your closet.
        </ThemedText>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {days.map((day) => (
            <View key={day.date} style={styles.reviewDaySection}>
              <View style={styles.dayLabelRow}>
                <ThemedText style={styles.dayLabel}>
                  {formatDateDisplay(new Date(`${day.date}T00:00:00`))}
                </ThemedText>
                <ThemedText style={styles.daySubLabel}>
                  {day.outfits.length} outfit{day.outfits.length > 1 ? "s" : ""}
                </ThemedText>
              </View>

              {day.outfits.map((outfit, outfitIndex) => (
                <View
                  key={`${day.date}-${outfit.suggestionId ?? outfitIndex}`}
                  style={[
                    styles.reviewOutfitRow,
                    { backgroundColor: theme.colors.card },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.reviewCoverBox}
                    activeOpacity={0.8}
                    onPress={() => onOpenDetails(day.date, outfitIndex, outfit)}
                  >
                    <OutfitCoverImage
                      itemIds={outfit.itemIds || []}
                      height={80}
                    />
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <ThemedText
                      style={{
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 4,
                      }}
                    >
                      Outfit {outfitIndex + 1}
                    </ThemedText>
                    <ThemedText
                      style={{ fontSize: 13, color: "#777", marginBottom: 10 }}
                    >
                      {outfit.score != null
                        ? `Score: ${outfit.score.toFixed(1)}`
                        : "Ready to save"}
                    </ThemedText>

                    <TouchableOpacity
                      style={[
                        styles.reviewEditBtn,
                        { borderColor: theme.colors.tabIconSelected },
                      ]}
                      onPress={() =>
                        onOpenDetails(day.date, outfitIndex, outfit)
                      }
                    >
                      <ThemedText
                        style={{
                          color: theme.colors.tabIconSelected,
                          fontWeight: "600",
                        }}
                      >
                        Edit Outfit
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}

          <TouchableOpacity
            onPress={onSaveTrip}
            activeOpacity={0.7}
            disabled={isSaving || days.length === 0}
            style={[
              styles.generateBtn,
              {
                backgroundColor: isSaving
                  ? "#ccc"
                  : theme.colors.tabIconSelected,
                marginTop: 8,
              },
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateBtnText}>Save Trip</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const TripOutfitDetailsModal = ({
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
      } catch (error) {
        console.error("Failed to load trip outfit items:", error);
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

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#e2d7cd" }]}
                onPress={() => onOpenEdit(items)}
              >
                <Text style={[styles.actionBtnText, { color: "#000" }]}>
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export default function TripOutfit() {
  const theme = useTheme();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Range selection
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // When user confirms range, user can then edit per-date count
  const [dateConfig, setDateConfig] = useState({});
  const [rangeConfirmed, setRangeConfirmed] = useState(false);

  // Trip-level state
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState(null); // Stores the final lat,lon for the payload
  const [searchResults, setSearchResults] = useState([]); // Stores the Open-Meteo array
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [formality, setFormality] = useState("CASUAL");
  const [weatherType, setWeatherType] = useState("SUNNY");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestionsByDate, setSuggestionsByDate] = useState({});

  const [generatedPlan, setGeneratedPlan] = useState(null); // holds { flatOutfits, daysPayload preview }
  const [isReviewVisible, setIsReviewVisible] = useState(false);

  // For per-outfit edit inside the review modal
  const [editingOutfit, setEditingOutfit] = useState(null); // { outfit, dayIso, outfitIndex }
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editableItems, setEditableItems] = useState([]);
  const [pendingEditItems, setPendingEditItems] = useState(null);
  const [reviewDays, setReviewDays] = useState([]); // [{ date: iso, outfits: [...] }]

  // Modal state
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeDate, setActiveDate] = useState(null);

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
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Allow location access to use this feature.",
        });
        return;
      }

      // 1. Instantly close dropdown and show loading text in the search bar
      setShowDropdown(false);
      setLocation("Locating...");

      // 2. Fetch coords (Using Balanced accuracy prevents hanging on Android/Emulators)
      const gps = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coordString = `${gps.coords.latitude},${gps.coords.longitude}`;
      setLocationCoords(coordString);

      // 3. Reverse geocode to get City, State, Country
      const geocode = await Location.reverseGeocodeAsync({
        latitude: gps.coords.latitude,
        longitude: gps.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const place = geocode[0];
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
          setLocation(coordString);
        }
      } else {
        setLocation(coordString);
      }
    } catch (error) {
      console.error("Location error:", error);
      setLocation(""); // Clear the "Locating..." text if it crashes
      Toast.show({
        type: "error",
        text1: "Location Error",
        text2: "Could not fetch current location. Please try typing it manually.",
      });
    }
  };

  // Handles confirm date range to later show per-date outfit  controls and enable generation
  const handleConfirmRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

      if (end < start) {
        // Alert.alert("Invalid Range", "End date must be after start date.");
        Toast.show({
          type: "error",
          text1: "Invalid Range",
          text2: "End date must be after start date.",
        });
      return;
    }

    const dates = getDateRange(start, end);
    if (dates.length > 7) {
       Toast.show({
        type: "error",
        text1: "Too Many Days",
        text2: "Please select a range of 7 days or less.",
      });
      return;
    }

    // save existing outfits counts if user is reselect date
    const config = {};
    dates.forEach((d) => {
      const iso = toISO(d);
      config[iso] = { outfitCount: dateConfig[iso]?.outfitCount ?? 1 };
    });

    setDateConfig(config);
    setRangeConfirmed(true);
    setSuggestionsByDate({});
  };

  const handleOutfitCountChange = (iso, delta) => {
    setDateConfig((prev) => ({
      ...prev,
      [iso]: {
        outfitCount: Math.min(
          3,
          Math.max(1, (prev[iso]?.outfitCount ?? 1) + delta),
        ),
      },
    }));
  };

  // TODO: Call backend API, for now its copy and similar version of regular generate call
  const getUserId = async () => {
    try {
      const storedIdString = await AsyncStorage.getItem("userId");
      if (storedIdString !== null) return parseInt(storedIdString, 10);
    } catch (error) {
      console.error("Storage error", error);
    }
    return null;
  };

  const handleOpenTripDetails = (dayIso, outfitIndex, outfit) => {
    setEditingOutfit({ dayIso, outfitIndex });
    setSelectedOutfit(outfit);
    setActiveDate(dayIso);
    setIsReviewVisible(false);
    setTimeout(() => setIsModalVisible(true), 350);
  };

  const handleOpenTripEdit = (prefetchedItems) => {
    setEditableItems(prefetchedItems);
    setPendingEditItems(prefetchedItems);
    setIsModalVisible(false);
  };

  const handleDoneEditing = (finalEditedItems, finalEditedItemIds) => {
    if (!editingOutfit) return;

    const updatedOutfit = {
      ...(selectedOutfit || {}),
      itemIds: finalEditedItemIds,
      editedItems: finalEditedItems,
    };

    setReviewDays((prev) =>
      prev.map((day) => {
        if (day.date !== editingOutfit.dayIso) return day;

        return {
          ...day,
          outfits: day.outfits.map((outfit, index) =>
            index === editingOutfit.outfitIndex ? updatedOutfit : outfit,
          ),
        };
      }),
    );

    setIsEditModalVisible(false);
    setEditableItems(finalEditedItems);
    setSelectedOutfit(updatedOutfit);
    setTimeout(() => setIsModalVisible(true), 250);
  };

  useEffect(() => {
    if (!isModalVisible && pendingEditItems) {
      setIsEditModalVisible(true);
      setPendingEditItems(null);
    }
  }, [isModalVisible, pendingEditItems]);

  const handleTripOutfitAction = (actionType) => {
    if (actionType !== "SAVE") return;

    setIsModalVisible(false);
    setActiveDate(null);
    setSelectedOutfit(null);
    setEditingOutfit(null);
    setEditableItems([]);
    setTimeout(() => setIsReviewVisible(true), 250);
  };

  const handleSaveTrip = async () => {
    if (!generatedPlan || reviewDays.length === 0) {
      Toast.show({
        type: "error",
        text1: "Missing",
        text2: "Generate a trip before saving it.",
      });
      return;
    }

    try {
      setIsGenerating(true);
      await apiClient.post("/api/trips", {
        ...generatedPlan,
        days: reviewDays,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Your trip has been saved to your closet!",
      });
      setIsReviewVisible(false);
      setReviewDays([]);
      setGeneratedPlan(null);
      setSelectedOutfit(null);
      setEditableItems([]);
      setPendingEditItems(null);
      setEditingOutfit(null);
      setIsModalVisible(false);
      setSuggestionsByDate({});
    } catch (error) {
      console.error("Trip save error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save the trip. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAndSaveTrip = async () => {
    if (!locationCoords && !location) {
      Toast.show({
        type: "error",
        text1: "Missing",
        text2: "Please select a location.",
      });
      return;
    }
    if (!dateConfig || Object.keys(dateConfig).length === 0) {
      Toast.show({
        type: "error",
        text1: "Missing",
        text2: "Please select your travel dates and configure outfit counts.",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const userId = await getUserId();
      const isoKeys = Object.keys(dateConfig).sort();

      // 1. Calculate total outfits needed
      const totalOutfits = isoKeys.reduce(
        (sum, iso) => sum + (dateConfig[iso]?.outfitCount || 1),
        0,
      );
      const finalLocationString = locationCoords
        ? `${locationCoords}|${location}`
        : location;

      const generatePayload = {
        location: finalLocationString || location,
        event: formality,
        memory: false,
      };

      // 2. Generate the outfits from the algorithm
      const genRes = await apiClient.post(
        `/api/v1/suggestions/trip/${userId}?totalOutfits=${totalOutfits}`,
        generatePayload,
      );
      const flatOutfits = genRes.data || [];

      if (flatOutfits.length === 0) {
        Toast.show({
          type: "error",
          text1: "No Outfits",
          text2: "No outfits could be generated based on your wardrobe and these constraints.",
        });
        return;
      }

      // 3. Slice and format the outfits for the Trip payload
      let currentIndex = 0;
      const daysPayload = isoKeys.map((iso) => {
        const amountForDay = dateConfig[iso]?.outfitCount || 1;
        const dailyOutfits = flatOutfits.slice(
          currentIndex,
          currentIndex + amountForDay,
        );
        currentIndex += amountForDay;

        return {
          date: iso,
          outfits: dailyOutfits,
        };
      });

      // 4. Hold the generated trip for review before saving
      const savePayload = {
        userId: userId,
        tripLocation: location,
        startDate: toISO(startDate),
        endDate: toISO(endDate),
        days: daysPayload,
      };

      setGeneratedPlan(savePayload);
      setReviewDays(daysPayload);
      setIsReviewVisible(true);
    } catch (error) {
      console.error("Trip generation/save error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to generate the trip. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const hasSuggestions = Object.keys(suggestionsByDate).length > 0;
  const buttonText = isGenerating ? "Processing..." : "Generate Trip Outfits";
  const rangeLabel = rangeConfirmed
    ? `${formatDateDisplay(startDate)} → ${formatDateDisplay(endDate)} (${Object.keys(dateConfig).length} days)`
    : null;

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <ThemedText
            style={[
              styles.headerTitle,
              { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h1 },
            ]}
          >
            Plan your{"\n"}trip style!
          </ThemedText>
        </View>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="cover"
        />
      </View>

      <View
        style={[
          styles.controlsContainer,
          {
            shadowColor: theme.colors.text,
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 3.5,
            elevation: 5,
          },
        ]}
      >
        {/* Select Occasion */}
        <ThemedText style={styles.sectionLabel}>Select Occasion:</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          {FORMALITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setFormality(opt)}
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
                // Format: "City, State, Country" (Admin1 is usually the state/province)
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

        {/* Expected Weather */}
        <ThemedText style={styles.sectionLabel}>Expected Weather:</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          {WEATHER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setWeatherType(opt)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    weatherType === opt
                      ? theme.colors.tabIconSelected
                      : theme.colors.card,
                },
              ]}
            >
              <Text
                style={{
                  color: weatherType === opt ? "#fff" : theme.colors.text,
                  fontSize: 14,
                }}
              >
                {formatEnum(opt)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        {/* Date Range: Later when we have time have like text editing as once day or year click */}
        <ThemedText style={styles.sectionLabel}>Trip Date Range:</ThemedText>
        <ThemedText style={styles.helperText}>Max 7 days</ThemedText>

        <InlineDatePicker
          label="Start Date"
          date={startDate}
          onChange={(d) => {
            setStartDate(d);
            setRangeConfirmed(false);
          }}
          theme={theme}
        />
        <InlineDatePicker
          label="End Date"
          date={endDate}
          onChange={(d) => {
            setEndDate(d);
            setRangeConfirmed(false);
          }}
          theme={theme}
        />

        <TouchableOpacity
          onPress={handleConfirmRange}
          style={[
            styles.confirmRangeBtn,
            { borderColor: theme.colors.tabIconSelected },
          ]}
        >
          <Text
            style={[
              styles.confirmRangeText,
              { color: theme.colors.tabIconSelected },
            ]}
          >
            {rangeConfirmed ? "Range Confirmed — Edit ^" : "Confirm Date Range"}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Per-date outfit count — shown after range confirmed */}
        {rangeConfirmed && Object.keys(dateConfig).length > 0 && (
          <View>
            <ThemedText style={styles.sectionLabel}>
              Outfits Per Date:
            </ThemedText>
            <ThemedText style={styles.helperText}>Max 3 per date</ThemedText>

            {Object.keys(dateConfig)
              .sort()
              .map((iso) => {
                const dateObj = new Date(iso + "T00:00:00");
                const count = dateConfig[iso].outfitCount;
                return (
                  <View
                    key={iso}
                    style={[
                      styles.dateCountRow,
                      { backgroundColor: theme.colors.card },
                    ]}
                  >
                    <ThemedText style={styles.dateCountLabel}>
                      {formatDateDisplay(dateObj)}
                    </ThemedText>
                    <View style={styles.miniStepper}>
                      <TouchableOpacity
                        style={[
                          styles.miniStepBtn,
                          { backgroundColor: "#e0e0e0" },
                        ]}
                        onPress={() => handleOutfitCountChange(iso, -1)}
                      >
                        <Text style={styles.miniStepText}>−</Text>
                      </TouchableOpacity>
                      <ThemedText style={styles.miniStepVal}>
                        {count}
                      </ThemedText>
                      <TouchableOpacity
                        style={[
                          styles.miniStepBtn,
                          { backgroundColor: theme.colors.tabIconSelected },
                        ]}
                        onPress={() => handleOutfitCountChange(iso, +1)}
                      >
                        <Text style={[styles.miniStepText, { color: "#fff" }]}>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

            <View style={styles.divider} />
          </View>
        )}

        <TouchableOpacity
          onPress={handleGenerateAndSaveTrip}
          activeOpacity={0.7}
          disabled={isGenerating || !rangeConfirmed}
          style={[
            styles.generateBtn,
            {
              backgroundColor: rangeConfirmed
                ? theme.colors.tabIconSelected
                : "#ccc",
              marginTop: 10,
            },
          ]}
        >
          {isGenerating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateBtnText}>Generate Trip</Text>
          )}
        </TouchableOpacity>

        {!rangeConfirmed && (
          <ThemedText
            style={[styles.helperText, { textAlign: "center", marginTop: 6 }]}
          >
            Confirm date range to enable generation
          </ThemedText>
        )}
      </View>
      {hasSuggestions &&
        Object.keys(dateConfig)
          .sort()
          .map((iso) => {
            const dateObj = new Date(iso + "T00:00:00");
            const dateSuggestions = suggestionsByDate[iso] || [];
            return (
              <View key={iso} style={styles.daySection}>
                <View style={styles.dayLabelRow}>
                  <ThemedText style={styles.dayLabel}>
                    {formatDateDisplay(dateObj)}
                  </ThemedText>
                  <ThemedText style={styles.daySubLabel}>
                    {dateConfig[iso]?.outfitCount} outfit
                    {dateConfig[iso]?.outfitCount > 1 ? "s" : ""}
                  </ThemedText>
                </View>
                {dateSuggestions.length === 0 ? (
                  <ThemedText style={styles.helperText}>
                    No outfits generated for this date.
                  </ThemedText>
                ) : (
                  <FlatList
                    data={dateSuggestions}
                    keyExtractor={(item) => item.suggestionId}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        style={[
                          styles.outfitCard,
                          { backgroundColor: theme.colors.lightBrown },
                        ]}
                        onPress={() => {
                          setSelectedOutfit(item);
                          setActiveDate(iso);
                          setIsModalVisible(true);
                        }}
                      >
                        <OutfitCoverImage
                          itemIds={item.itemIds || []}
                          height={120}
                        />
                        <View
                          style={[
                            styles.cardFooter,
                            { backgroundColor: theme.colors.card },
                          ]}
                        >
                          <ThemedText>
                            Score: {item.score?.toFixed(1)}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            );
          })}

      <TripReviewModal
        visible={isReviewVisible}
        days={reviewDays}
        onClose={() => setIsReviewVisible(false)}
        onOpenDetails={handleOpenTripDetails}
        onSaveTrip={handleSaveTrip}
        isSaving={isGenerating}
        theme={theme}
      />

      <TripOutfitDetailsModal
        visible={isModalVisible}
        outfit={selectedOutfit}
        editedItems={editableItems}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedOutfit(null);
          setActiveDate(null);
        }}
        onAction={handleTripOutfitAction}
        onOpenEdit={handleOpenTripEdit}
        theme={theme}
      />

      <EditOutfitModal
        visible={isEditModalVisible}
        initialItems={editableItems}
        onClose={() => {
          setIsEditModalVisible(false);
          setEditableItems([]);
          setPendingEditItems(null);
          setEditingOutfit(null);
          setSelectedOutfit(null);
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
    marginBottom: 10,
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
  },
  helperText: {
    fontSize: 12,
    color: "#aaa",
    marginBottom: 8,
  },
  // Inline date picker
  dateSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 4,
  },
  pickerBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 14,
  },
  pickerCol: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  pickerColLabel: {
    fontSize: 11,
    color: "#aaa",
    marginBottom: 4,
  },
  pickerVal: {
    fontSize: 18,
    fontWeight: "bold",
    minWidth: 44,
    textAlign: "center",
  },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  pickerCancel: {
    padding: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
  },
  pickerConfirm: {
    padding: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  // Range confirm button
  confirmRangeBtn: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 8,
  },
  confirmRangeText: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Per-date outfit count rows
  dateCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  dateCountLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  miniStepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  miniStepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  miniStepText: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 22,
    color: "#333",
  },
  miniStepVal: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
  // Generate
  generateBtn: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  generateBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  // Results
  daySection: {
    marginHorizontal: 30,
    marginBottom: 16,
  },
  dayLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  daySubLabel: {
    fontSize: 13,
    color: "#aaa",
  },
  outfitCard: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 20,
    maxWidth: "48%",
    overflow: "hidden",
  },
  cardImagePlaceholder: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  cardFooter: { padding: 10 },
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
  reviewDaySection: { marginBottom: 18 },
  reviewOutfitRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewCoverBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#d6c6b8",
  },
  reviewEditBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
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
  replacementImage: { width: "100%", height: 150 },
});
