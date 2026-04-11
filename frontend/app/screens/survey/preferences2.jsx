import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import { useSurvey } from "../../../context/SurveyContext";
import { theme } from "../../../constants";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {apiClient} from "../../../scripts/apiClient";


const OPTIONS = {
    fit: [ "Loose/Oversized", "Relaxed", "Fitted", "Structured/Tailored", "Depends on occasion", ],
    items: ["Jeans","Leggings","Skirts","Dresses","Hoodies","Blazers",],
    colors: ["Neutral tones","Earth tones","Pastels","Bright colors","Cool tones","Warm tones",],
    tripPriority: ["Avoid repeating items","Minimize packing","Maximize variety","Coordinate colors",],
    avoidItems: ["Skinny Jeans","Bright Neon Colors","Deep V-Necks","Baggy / Oversized Clothes",],
};

export default function Preferences2() {
  const { answers, setAnswers } = useSurvey();

  const selectOne = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleMulti = (key, value) => {
    setAnswers((prev) => {
      const exists = (prev[key] || []).includes(value);
      return { ...prev, [key]: exists ? prev[key].filter((v) => v !== value)  : [...(prev[key] || []), value], };
    });
  };

  const renderOptions = (key, list, multi = false) =>
    list.map((option) => {
      const selected = multi
        ? answers[key].includes(option)
        : answers[key] === option;

      return (
        <TouchableOpacity  key={option}  onPress={() =>  multi ? toggleMulti(key, option) : selectOne(key, option)  }  style={[styles.option, selected && styles.selected]}>
          <ThemedText>{option}</ThemedText>
        </TouchableOpacity>
      );
    });

  const router = useRouter();
  /* method to make all survey questions mandatory */
  
  // const validateAnswers = () => {
  //   if (!answers.fit) return "Please select a fit preference.";

  //   if (!answers.items || answers.items.length === 0)
  //     return "Please select at least one item you wear.";

  //   if (!answers.avoidItems || answers.avoidItems.length === 0)
  //     return "Please select at least one item to avoid.";

  //   if (!answers.colorsWear || answers.colorsWear.length === 0)
  //     return "Please select colors you wear.";

  //   if (!answers.colorsAvoid || answers.colorsAvoid.length === 0)
  //     return "Please select colors you avoid.";

  //   if (!answers.tripPriority)
  //     return "Please select a trip priority.";
  //   return null; 
  // };
  const handleSave = async () => {
    //method call for validateAnswers()
    // const errorMessage = validateAnswers();
    // if (errorMessage) {
    //   Alert.alert("Missing Information", errorMessage);
    //   return; //stop submission
    // }
    try {
      const storedUserId = await AsyncStorage.getItem("userId");

      const userId = Number(storedUserId);
      if (!Number.isInteger(userId) || userId <= 0) {
        Alert.alert("Error", "Please log in again before saving preferences.");
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
      await apiClient.post("/api/preferences", payload);
      Alert.alert("Preferences saved!");
      setTimeout(() => {
        console.log("Successfully saved");
        router.replace("/(tabs)"); 
      }, 300);
    } catch (error) {
      console.error("Failed to save preferences:", error?.response?.data || error?.message || error);
      Alert.alert("Error", "Failed to save preferences");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView>
        <View>
            <ThemedText style={{ fontSize: theme.sizes.h1,  fontFamily: theme.fonts.bold, marginBottom: 20}} > Continue...</ThemedText>
        </View>

        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }}>What fit do you prefer?</ThemedText>
            {renderOptions("fit", OPTIONS.fit)}
        </View>

        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }} >Which items do you wear most?</ThemedText>
            {renderOptions("items", OPTIONS.items, true)}
        </View>

        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }} >Are there any items or styles you absolutely NEVER wear?</ThemedText>{
            renderOptions("avoidItems", OPTIONS.avoidItems, true)} 
        </View>

        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }}>What colors do you wear the most often?</ThemedText>
            {renderOptions("colorsWear", OPTIONS.colors, true)}
        </View>

        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }} >What colors do you avoid?</ThemedText>
            {renderOptions("colorsAvoid", OPTIONS.colors, true)}
        </View>

        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }} >Trip Priority?</ThemedText>
            {renderOptions("tripPriority", OPTIONS.tripPriority)} 
        </View>
        
        <TouchableOpacity style={styles.btn} onPress={handleSave}>
          <ThemedText>Save Preferences</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  option: { padding: 10, borderWidth: 1, marginVertical: 5, borderRadius: 8 },
  selected: { backgroundColor: "#B49480" },
  btn: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#B49480",
    borderRadius: 10,
    alignItems: "center",
  },
});