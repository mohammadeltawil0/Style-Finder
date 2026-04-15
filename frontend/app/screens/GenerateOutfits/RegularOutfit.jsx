import { useState } from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
} from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect } from "react";
import { apiClient } from "../../../scripts/apiClient";
import * as Location from "expo-location";
import Entypo from "@expo/vector-icons/Entypo";

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

// --- OUTFIT DETAILS MODAL ---
const OutfitDetailsModal = ({ visible, outfit, onClose, onAction, theme }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOutfitItems = async () => {
      if (!outfit || !outfit.itemIds) return;
      try {
        setIsLoading(true);
        const itemPromises = outfit.itemIds.map((id) =>
          apiClient.get(`/api/items/${id}`),
        );
        const responses = await Promise.all(itemPromises);
        let fetchedItems = responses.map((res) => res.data);
        const typeOrder = {
          OVER: 1,
          OUTERWEAR: 1,
          TOP: 2,
          FULL_BODY: 3,
          BOTTOM: 4,
        };
        fetchedItems.sort(
          (a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99),
        );
        setItems(fetchedItems);
      } catch (error) {
        console.error("Failed to load items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (visible) fetchOutfitItems();
  }, [visible, outfit]);

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
                    {formatEnum(item.type)}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14, marginBottom: 10 }}>
                    A {item.color?.toLowerCase()} {formatEnum(item.fit)} fit{" "}
                    {formatEnum(item.type).toLowerCase()}.
                  </ThemedText>
                  {/* Image Placeholder for visualization */}
                   <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImagePlaceholder}
                    resizeMode="cover"
                  />
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
                onPress={() => onAction("EDIT_SAVE")}
              >
                <Text style={[styles.actionBtnText, { color: "#000" }]}>
                  Edit & Save
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

// --- MAIN SCREEN ---
export default function Recommendations() {
  const theme = useTheme();
  const router = useRouter();

  // Andrew's original state variables
  const [suggestions, setSuggestions] = useState([]);
  const [formality, setFormality] = useState("CASUAL");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useMemory, setUseMemory] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // New State Variable for toogling between regular and Trip outfits
  const [isRegularOutfit, setIsRegularOutfit] = useState(true);

  const handleToggleOutfit = async (value) => {
    setIsRegularOutfit(value);
    await AsyncStorage.setItem("recommendationTab", value ? "regular" : "trip");
  };

  // TODO: Talk about this to group!!
  // Old one's to maintain proper UI and location manual bc user can be anywhere to plan the next outfit
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [location, setLocation] = useState("");
  const [showDropdown, setShowDropdown] = useState(false); // For location autocomplete dropdown
  const [eventType, setEventType] = useState(""); // If formality is formal, ask for which event ...

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

  const filteredLocations = predefinedLocations.filter((locate) =>
    `${locate.city}, ${locate.state}, ${locate.country}`
      .toLowerCase()
      .includes(location.toLowerCase()),
  );

  // TODO: Additional constraints state if we plan to add that button back in
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

  // On screen focus, load any saved constraints from AsyncStorage (if user navigated back from different screen)
  useFocusEffect(
    React.useCallback(() => {
      const loadSavedConstraints = async () => {
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
          setTopFit(parsed.topFit || []);
          setTopLength(parsed.topLength || []);
          setBottomFit(parsed.bottomFit || []);
          setBottomLength(parsed.bottomLength || []);
          setFullBody(parsed.fullBody || false);
          setFullBodyLength(parsed.fullBodyLength || []);
          setOuterwear(parsed.outerwear || false);
          setOuterFit(parsed.outerFit || []);
          setPatterns(parsed.patterns || false);
          setColor(parsed.color || "");
        }
      };
      loadSavedConstraints();
    }, []),
  );

  // TODO: ASK team, navigate to additonal constraints screen.
  // const handleAdditionalConstraints = () => {
  //   router.push({
  //     pathname: "/screens/GenerateOutfits/AdditionalConstraints",
  //     params: {
  //       constraints: JSON.stringify(extraConstraints || {}),
  //       location,
  //       formality,
  //       eventType,
  //       weatherEnabled
  //     }
  //   });
  // };

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

  // Andrew's origianl function name fetchSuggestions but renamed to be more descriptive of the action
  const handleGenerateOutfit = async () => {
    if (!location || !formality) {
      Alert.alert("Missing Fields", "Location and Occasion are required.");
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
      let gpsLocation = await Location.getCurrentPositionAsync({});
      const locationCoords = `${gpsLocation.coords.latitude},${gpsLocation.coords.longitude}`;

      const userId = await getUserId();

      // Add data from additional constraints if we have it
      const data = {
        location: locationCoords,
        event: formality,
        useMemory,
        // Additional fields
        manualLocation: location,
        eventType,
        weatherEnabled,
        topFit,
        topLength,
        bottomFit,
        bottomLength,
        fullBody,
        fullBodyLength,
        outerwear,
        outerFit,
        patterns,
        color,
      };

      console.log("=== Generate Outfit Request ===");
      console.log("UserId:", userId);
      console.log("Payload:", JSON.stringify(data, null, 2));

      const res = await apiClient.post(
        `/api/v1/suggestions/hub/${userId}`,
        data,
      );

      console.log("=== Generate Outfit Response ===");
      console.log("Response:", JSON.stringify(res.data, null, 2));

      // Populate the grid with results
      setSuggestions(res.data?.slice(0, 10) || []);

      // Navigation to waiting screen commented out for now
      // await AsyncStorage.setItem("pendingOutfitRequest", JSON.stringify(data));
      // resetAllConstraints();
      // router.push("/screens/GenerateOutfits/OutfitswaitingScreen");
    } catch (error) {
      console.error("=== Generate Outfit Error ===", error);
      Alert.alert("Error", "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAction = async (actionType, editedItemIds = null) => {
    if (!selectedOutfit) return;

    try {
      await apiClient.post(`/api/v1/suggestions/feedback`, {
        userId: await getUserId(),
        suggestionId: selectedOutfit.suggestionId,
        originalItemIds: selectedOutfit.itemIds,
        finalItemIds: editedItemIds || selectedOutfit.itemIds,
        action: actionType,
        contextTemp: 72,
        contextOccasion: formality || "Casual",
      });

      console.log("=== Feedback Sent ===");
      console.log(
        "Action:",
        actionType,
        "SuggestionId:",
        selectedOutfit.suggestionId,
      );

      // Remove the acted-upon outfit from the grid
      setSuggestions((prev) =>
        prev.filter(
          (outfit) => outfit.suggestionId !== selectedOutfit.suggestionId,
        ),
      );
      setIsModalVisible(false);
      setSelectedOutfit(null);
    } catch (error) {
      console.error("=== Feedback Error ===", error);
      Alert.alert("Error", "Failed to process your choice.");
    }
  };

  const resetAllConstraints = async () => {
    await AsyncStorage.removeItem("recommendationConstraints");
    setLocation("");
    setFormality("CASUAL");
    setEventType("");
    setWeatherEnabled(true);
    setUseMemory(false);
    setIsRegularOutfit(true);
  };

  // Dynamic button text matching first file logic
  const buttonText = isGenerating
    ? "Processing..."
    : useMemory
      ? "Recall Outfits"
      : "Generate Outfit";

  return (
    <View>
      {/* Header — title + logo */}
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

      <View style={styles.controlsContainer}>
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

        {/* Event Type — only for FORMAL */}
        {formality === "FORMAL" && (
          <View style={{ marginBottom: 20 }}>
            <ThemedText style={styles.sectionLabel}>Event Type:</ThemedText>
            <TextInput
              placeholder="e.g. Wedding, Gala, Interview..."
              placeholderTextColor="#aaa"
              value={eventType}
              onChangeText={(text) => setEventType(text)}
              style={[styles.input, { color: theme.colors.text }]}
            />
          </View>
        )}

        {/* Location */}
        <ThemedText style={styles.sectionLabel}>Location:</ThemedText>
        <TextInput
          placeholder="City, State, Country"
          placeholderTextColor="#aaa"
          value={location}
          onChangeText={(text) => {
            setLocation(text);
            setShowDropdown(text.length > 0);
          }}
          style={[styles.input, { color: theme.colors.text, marginBottom: 4 }]}
        />
        {showDropdown && filteredLocations.length > 0 && (
          <ScrollView
            style={styles.filterList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {filteredLocations.map((locate, index) => (
              <ThemedText
                key={index}
                style={styles.dropdownItem}
                onPress={() => {
                  setLocation(
                    `${locate.city}, ${locate.state}, ${locate.country}`,
                  );
                  setShowDropdown(false);
                }}
              >
                {locate.city}, {locate.state}, {locate.country}
              </ThemedText>
            ))}
          </ScrollView>
        )}

        <View style={styles.divider} />

        {/* Consider Weather toggle */}
        <View style={styles.toggleRow}>
          <ThemedText style={styles.toggleLabel}>Consider Weather:</ThemedText>
          <Switch
            trackColor={{
              false: "#767577",
              true: theme.colors.tabIconSelected,
            }}
            thumbColor={"#f4f3f4"}
            onValueChange={setWeatherEnabled}
            value={weatherEnabled}
          />
        </View>

        {/* Recall past outfits toggle */}
        <View style={styles.toggleRow}>
          <ThemedText style={styles.toggleLabel}>
            Recall past outfits?
          </ThemedText>
          <Switch
            trackColor={{
              false: "#767577",
              true: theme.colors.tabIconSelected,
            }}
            thumbColor={"#f4f3f4"}
            onValueChange={setUseMemory}
            value={useMemory}
          />
        </View>

        <View style={styles.divider} />

        {/* Additional Constraints — commented out until ready */}
        {/* <TouchableOpacity
                  onPress={handleAdditionalConstraints}
                  activeOpacity={0.7}
                  style={styles.outlineBtn}
                >
                  <ThemedText style={styles.outlineBtnText}>Additional Constraints</ThemedText>
                </TouchableOpacity> */}

        {/* Generate / Recall button */}
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

      {/* Results Grid — only shown when suggestions exist */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.suggestionId}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 30, paddingBottom: 20 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.outfitCard,
                { backgroundColor: theme.colors.lightBrown },
              ]}
              onPress={() => {
                setSelectedOutfit(item);
                setIsModalVisible(true);
              }}
            >
              <View style={styles.cardImagePlaceholder}>
                <ThemedText>Outfit {index + 1}</ThemedText>
              </View>
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

      {/* Outfit Details Modal */}
      <OutfitDetailsModal
        visible={isModalVisible}
        outfit={selectedOutfit}
        onClose={() => setIsModalVisible(false)}
        onAction={handleAction}
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
  headerTitle: {
    lineHeight: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
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
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  outlineBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#ccc",
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 12,
  },
  outlineBtnText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  generateBtn: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  generateBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
  cardFooter: {
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  chevronView: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  responseContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  itemImagePlaceholder: {
    height: 180,
    borderRadius: 10,
    marginTop: 5,
  },
  modalActions: {
    marginTop: 20,
    gap: 10,
  },
  actionBtn: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
