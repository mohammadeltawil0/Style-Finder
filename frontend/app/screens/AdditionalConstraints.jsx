import { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { useTheme, useRoute, useNavigation } from "@react-navigation/native";

export default function AdditionalConstraints() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  // get current constraints from params
  const { currentConstraints } = route.params || {};

  const [fit, setFit] = useState(currentConstraints?.fit || "Regular");
  const [fullBody, setFullBody] = useState(currentConstraints?.fullBody || false);
  const [outerwear, setOuterwear] = useState(currentConstraints?.outerwear || false);

  const fitOptions = ["Tight", "Regular", "Loose"];

  const handleSave = () => {
    navigation.navigate("Recommendations", {
      updatedConstraints: { fit, fullBody, outerwear },
    });
  };

  return (
    <ThemedView gradient={false} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 20, alignItems: "center" }}
      >
        {/* Fit Selector */}
        <View style={{ width: "90%", marginTop: 20 }}>
          <ThemedText style={{ fontSize: theme.sizes.h3, marginBottom: 15 }}>
            Fit:
          </ThemedText>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {fitOptions.map(option => (
              <ThemedText
                key={option}
                onPress={() => setFit(option)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: fit === option ? "#000" : "#ccc",
                  backgroundColor: fit === option ? "#e5d3b3" : "#f0f0f0",
                  textAlign: "center",
                }}
              >
                {option}
              </ThemedText>
            ))}
          </View>
        </View>

        {/* Full Body Toggle */}
        <View
          style={{
            flexDirection: "row",
            width: "80%",
            marginTop: 30,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <ThemedText style={{ fontSize: theme.sizes.h3 }}>Full Body Outfit:</ThemedText>
          <TouchableOpacity
            onPress={() => setFullBody(!fullBody)}
            style={{
              width: 50,
              height: 30,
              borderRadius: 15,
              backgroundColor: fullBody ? "#d39f44" : "#ccc",
              justifyContent: "center",
              alignItems: fullBody ? "flex-end" : "flex-start",
              padding: 3,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#fff",
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Outerwear Toggle */}
        <View
          style={{
            flexDirection: "row",
            width: "80%",
            marginTop: 30,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <ThemedText style={{ fontSize: theme.sizes.h3 }}>Include Outerwear:</ThemedText>
          <TouchableOpacity
            onPress={() => setOuterwear(!outerwear)}
            style={{
              width: 50,
              height: 30,
              borderRadius: 15,
              backgroundColor: outerwear ? "#d39f44" : "#ccc",
              justifyContent: "center",
              alignItems: outerwear ? "flex-end" : "flex-start",
              padding: 3,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: "#fff",
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={{ width: "90%", marginTop: 50 }}>
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.7}
            style={{
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "#ccc",
              alignItems: "center",
              paddingVertical: 12,
              backgroundColor: "#e5d3b3",
            }}
          >
            <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}>Save</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}