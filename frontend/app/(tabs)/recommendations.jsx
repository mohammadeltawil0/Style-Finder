import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { OutfitToggle } from "../../components/outfit-toggle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import RegularOutfit from "../screens/GenerateOutfits/RegularOutfit";
import TripOutfit from "../screens/GenerateOutfits/TripOutfit";
import { useTheme } from "@react-navigation/native";

// --- MAIN SCREEN ---
export default function SuggestionHub() {
  // toggling between regular and Trip outfits
  const [isRegularOutfit, setIsRegularOutfit] = useState(true);

  const handleToggleOutfit = async (value) => {
    setIsRegularOutfit(value);
    await AsyncStorage.setItem("recommendationTab", value ? "regular" : "trip");
  };

  const theme = useTheme();

  return (
    <ThemedView gradient={false} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          {/* Outfit Type Toggle */}
          <OutfitToggle isRegularOutfit={isRegularOutfit} toggleOutfit={handleToggleOutfit} />
          
          {isRegularOutfit ? <RegularOutfit /> : <TripOutfit />}
          
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}