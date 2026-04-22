import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { ThemedText, ThemedView } from "../../../components";
import { theme } from "../../../constants";
import { useSurvey } from "../../../context/SurveyContext";
import { apiClient } from "../../../scripts/apiClient";

const OPTIONS = {
  fit: [
    "Loose/Oversized",
    "Relaxed",
    "Fitted",
    "Structured/Tailored",
    "Depends on occasion",
  ],
  items: ["Jeans", "Leggings", "Skirts", "Dresses", "Hoodies", "Blazers"],
  colors: [
    "Neutral tones",
    "Earth tones",
    "Pastels",
    "Bright colors",
    "Cool tones",
    "Warm tones",
  ],
  tripPriority: [
    "Avoid repeating items",
    "Minimize packing",
    "Maximize variety",
    "Coordinate colors",
  ],
  avoidItems: [
    "Skinny Jeans",
    "Bright Neon Colors",
    "Deep V-Necks",
    "Baggy / Oversized Clothes",
  ],
};

export default function Preferences2() {
  const { answers, setAnswers } = useSurvey();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const isNewUser = params?.isNewUser === "true";

  const selectOne = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMulti = (key, value) => {
    setAnswers((prev) => {
      const exists = (prev[key] || []).includes(value);
      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((v) => v !== value)
          : [...(prev[key] || []), value],
      };
    });
  };

  const renderOptions = (key, list, multi = false) =>
    list.map((option) => {
      const selected = multi
        ? answers[key].includes(option)
        : answers[key] === option;

      return (
        <TouchableOpacity
          key={option}
          onPress={() =>
            multi ? toggleMulti(key, option) : selectOne(key, option)
          }
          style={[styles.option, selected && styles.selected]}
        >
          <ThemedText>{option}</ThemedText>
        </TouchableOpacity>
      );
    });

  const router = useRouter();

  const showSuccessToast = () => {
    Toast.show({
      type: "success",
      text1: "Success!",
      text2: "You have successfully saved your preferences.",
    });
  };

  // Pass message to show in toast, e.g. "Please enter username and password"
  const showErrorToast = (message) => {
    Toast.show({
      type: "error",
      text1: "Error!",
      text2: message,
    });
  };

  const handleSave = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");

      const userId = Number(storedUserId);
      if (!Number.isInteger(userId) || userId <= 0) {
        showErrorToast("Invalid user ID. Please log in again.");
        return;
      }

      const payload = {
        userId,
        comfort: answers.comfort,
        occasion: answers.occasion,
        weather: answers.weather,
        style: answers.style,
        preferFit: answers.fit,
        items: answers.items,
        avoidItems: answers.avoidItems,
        colorsWear: answers.colorsWear,
        colorsAvoid: answers.colorsAvoid,
        tripPriority: answers.tripPriority,
      };

    // ACTION 1: Save to the raw Preferences table
    await apiClient.post("/api/preferences", payload);
    console.log("Raw preferences saved successfully.");

    // ACTION 2: Update the UserWeights table for the algorithm
    await apiClient.post("/api/weights/update", payload);
    console.log("Algorithm UserWeights updated successfully.");

      setTimeout(() => {
        console.log("Successfully saved");
        showSuccessToast();
        router.replace("/(tabs)");
      }, 300);
    } catch (error) {
      console.error(
        "Failed to save preferences:",
        error?.response?.data || error?.message || error,
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={{ flexDirection: "column", gap: 30 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <ThemedText
            style={{
              fontSize: theme.sizes.h2,
              fontFamily: theme.fonts.semiBold,
              flex: 1,
            }}
          >
            Continue...
          </ThemedText>
        </View>

        <View>
          <ThemedText style={{ fontFamily: theme.fonts.bold }}>
            What fit do you prefer?
          </ThemedText>
          {renderOptions("fit", OPTIONS.fit)}
        </View>

        <View>
          <ThemedText style={{ fontFamily: theme.fonts.bold }}>
            Which items do you wear most?
          </ThemedText>
          {renderOptions("items", OPTIONS.items, true)}
        </View>

        <View>
          <ThemedText style={{ fontFamily: theme.fonts.bold }}>
            Are there any items or styles you absolutely NEVER wear?
          </ThemedText>
          {renderOptions("avoidItems", OPTIONS.avoidItems, true)}
        </View>

        <View>
          <ThemedText style={{ fontFamily: theme.fonts.bold }}>
            What colors do you wear the most often?
          </ThemedText>
          {renderOptions("colorsWear", OPTIONS.colors, true)}
        </View>

        <View>
          <ThemedText style={{ fontFamily: theme.fonts.bold }}>
            What colors do you avoid?
          </ThemedText>
          {renderOptions("colorsAvoid", OPTIONS.colors, true)}
        </View>

        <View>
          <ThemedText style={{ fontFamily: theme.fonts.bold }}>
            Trip Priority?
          </ThemedText>
          {renderOptions("tripPriority", OPTIONS.tripPriority)}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <ThemedText style={{ fontFamily: theme.fonts.bold }}>Save Preferences</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20, paddingHorizontal: 30 },
  option: { padding: 10, borderWidth: 1, marginVertical: 5, borderRadius: 8 },
  selected: { backgroundColor: "#B49480" },
  btn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#B49480",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20
  },
});
