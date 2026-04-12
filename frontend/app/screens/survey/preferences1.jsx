import { ScrollView, View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import { useRouter } from "expo-router";
import { theme } from "../../../constants";
import { useSurvey } from "../../../context/SurveyContext";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {apiClient} from "../../../scripts/apiClient";

const OPTIONS = {
  comfort: [ "Comfort is my top priority", "Balanced – style + comfort", "Style over comfort", ],
  occasion: [ "School/University", "Work/Office", "Going out", "Dates", "Travel", "Gym", "Formal Events", "Casual/everyday outings",],
  weather: [ "Always prioritize weather", "Balance weather & style", "Style over weather",],
  style: [ "Casual & Comfortable", "Sporty / Athleisure","Business / Professional", "Minimalist", "Trendy / Fashion-forward", "Streetwear", "Preppy", "Edgy",],
};

export default function Preferences1() {
  const router = useRouter();
  const { answers, setAnswers, resetAnswers } = useSurvey();
  //saves preferences from previous sessions
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) return;

        const userId = Number(storedUserId);
        if (!Number.isInteger(userId) || userId <= 0) {
          console.warn("Invalid stored userId:", storedUserId);
          resetAnswers();
          return;
        }

        const response = await apiClient.get(`/api/preferences/${userId}`);
        const data = response.data;

        console.log("LOADED PREFS:", data);

        setAnswers((prev) => ({
          ...prev,
          comfort: data.comfort || "",

          occasion: Array.isArray(data.occasion)
            ? data.occasion
            : data.occasion?.split(",") || [],

          weather: data.weather || "",

          style: Array.isArray(data.style)
            ? data.style
            : data.style?.split(",") || [],

          fit: data.preferFit || "",

          items: Array.isArray(data.items)
            ? data.items
            : data.items?.split(",") || [],

          avoidItems: Array.isArray(data.avoidItems)
            ? data.avoidItems
            : data.avoidItems?.split(",") || [],

          colorsWear: Array.isArray(data.colorsWear)
            ? data.colorsWear
            : data.colorsWear?.split(",") || [],

          colorsAvoid: Array.isArray(data.colorsAvoid)
            ? data.colorsAvoid
            : data.colorsAvoid?.split(",") || [],

          tripPriority: data.tripPriority || "",
        }));

      } catch (err) {
        if (err.response?.status === 404) {
          console.log("No existing preferences (new user)");
          resetAnswers();
        } else {
          console.error("Error loading preferences:", err);
        } 
      }
    };

    loadPreferences();
  }, []);

  const selectOne = (key, value) => { setAnswers((prev) => ({ ...prev, [key]: value })); };

    const toggleMulti = (key, value) => {
        setAnswers((prev) => {
        const exists = prev[key].includes(value);
        return {
        ...prev,
        [key]: exists
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
        };
        });
    };

    const renderOptions = (key, list, multi = false) =>
        list.map((option) => {
      const selected = multi ? answers[key].includes(option) : answers[key] === option;
      return (
        <TouchableOpacity key={option} onPress={() => multi ? toggleMulti(key, option) : selectOne(key, option) } style={[styles.option, selected && styles.selected]}>
          <ThemedText>{option}</ThemedText>
        </TouchableOpacity>
      );
    });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView>
        <View>
            <ThemedText style={{ fontSize: theme.sizes.h1,  fontFamily: theme.fonts.bold, marginBottom: 20}}>hi, let’s get to know you!! </ThemedText>
        </View>

        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }} >How important is comfort when choosing outfits?</ThemedText>
            {renderOptions("comfort", OPTIONS.comfort)}
        </View>

        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }} >For what occasion will you be using our sytem most?</ThemedText> 
            {renderOptions("occasion", OPTIONS.occasion, true)}
        </View>

        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }} >Weather vs Style?</ThemedText>
            {renderOptions("weather", OPTIONS.weather)}
        </View>

        {/* DID MULTIPLE, ASK GROUP */}
        <View>
            <ThemedText style={{fontFamily: theme.fonts.bold, }} >How would you describe your everyday style?</ThemedText>
            {renderOptions("style", OPTIONS.style, true)}
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => router.push("screens/survey/preferences2")}>
          <ThemedText>Next</ThemedText>
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
  title: { fontSize: theme.sizes.h1 , marginBottom:2 },
});

