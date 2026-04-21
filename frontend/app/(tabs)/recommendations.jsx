import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform, View, StyleSheet, ScrollView } from "react-native";
import { ThemedView } from "../../components";
import { OutfitToggle } from "../../components/outfit-toggle";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import your fully self-sufficient feature components
import RegularOutfit from "../screens/GenerateOutfits/RegularOutfit";
import TripOutfit from "../screens/GenerateOutfits/TripOutfit";

export default function SuggestionHub() {
  const [isRegularOutfit, setIsRegularOutfit] = useState(true);

  // 1. HYDRATE STATE
  useEffect(() => {
    const loadTabState = async () => {
      try {
        const savedTab = await AsyncStorage.getItem("recommendationTab");
        if (savedTab) {
          setIsRegularOutfit(savedTab === "regular");
        }
      } catch (error) {
        console.error("Failed to load recommendation tab state:", error);
      }
    };
    loadTabState();
  }, []);

  const handleToggleOutfit = async (value) => {
    setIsRegularOutfit(value);
    try {
      await AsyncStorage.setItem("recommendationTab", value ? "regular" : "trip");
    } catch (error) {
      console.error("Failed to save recommendation tab state:", error);
    }
  };

  return (
      <ThemedView gradient={false} style={styles.container}>
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          {/* RESTORED SCROLLVIEW: Allows the user to scroll past the heavy UI controls */}
          <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
          >
            <View style={styles.toggleWrapper}>
              <OutfitToggle
                  isRegularOutfit={isRegularOutfit}
                  toggleOutfit={handleToggleOutfit}
              />
            </View>

            {/* Render the appropriate smart component */}
            {isRegularOutfit ? <RegularOutfit /> : <TripOutfit />}

          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40, // Ensures you can scroll past the very last item
  },
  toggleWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  }
});