import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, View, } from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";
import Feather from "@expo/vector-icons/Feather";

const titleCaseFromEnum = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  const raw = String(value);
  const specialMap = {
    PLAID_OR_FLANNEL: "Plaid/Flannel",
    GEOMETRIC_OR_ABSTRACT: "Geometric/Abstract",
    PARTY_OR_NIGHT_OUT: "Party/Night Out",
    ACTIVE_OR_SPORT: "Active/Sport",
    WORK_OR_SMART: "Work/Smart",
    KNEE_LENGTH_OR_BERMUDA: "Knee Length/Bermuda",
    MAXI_OR_FULL_LENGTH: "Maxi/Full Length",
    MIDI_OR_CAPRI: "Midi/Capri",
    ALL_SEASONS: "All Seasons",
    FULL_BODY: "Full Body",
    OUTERWEAR: "Outerwear",
  };

  if (specialMap[raw]) return specialMap[raw];

  return raw
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const materialMap = {
  1: "Cotton",
  2: "Linen/Hemp",
  3: "Wool/Fleece",
  4: "Silk/Satin",
  5: "Leather/Faux Leather",
  6: "Synthetics",
  7: "Other",
};

const fitToDisplay = (fitValue) => {
  if (fitValue === null || fitValue === undefined || fitValue === "") {
    return "Not specified";
  }

  if (typeof fitValue === "number") {
    const fitMap = {
      0: "Slim",
      1: "Regular",
      2: "Loose",
    };
    return fitMap[fitValue] || "Not specified";
  }

  return titleCaseFromEnum(fitValue);
};

const materialToDisplay = (materialValue) => {
  if (
    materialValue === null ||
    materialValue === undefined ||
    materialValue === ""
  ) {
    return "Not specified";
  }

  if (typeof materialValue === "number") {
    return materialMap[materialValue] || "Not specified";
  }

  const parsedNumber = Number(materialValue);
  if (!Number.isNaN(parsedNumber) && materialMap[parsedNumber]) {
    return materialMap[parsedNumber];
  }

  return titleCaseFromEnum(materialValue);
};

const FieldCard = ({ label, value, theme }) => (
  <View
    style={[
      styles.fieldCard,
      {
        backgroundColor: theme.colors.card,
      },
    ]}
  >
    <View style={styles.fieldBody}>
      <ThemedText
        style={[
          styles.fieldLabel,
          { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 },
        ]}
      >
        {label}
      </ThemedText>
      <ThemedText
        style={[
          styles.fieldValue,
          { fontFamily: theme.fonts.regular, fontSize: theme.sizes.text },
        ]}
      >
        {value}
      </ThemedText>
    </View>
  </View>
);

export default function ItemDetail() {
  const theme = useTheme();
  const { itemId } = useLocalSearchParams(); // Has itemId from route params

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch item details 
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        if (!itemId) return;

        const response = await apiClient.get(`/api/items/${itemId}`);
        if (response.status === 200) {
          setItem(response.data);
        }
      } catch (error) {
        console.error(
          "Failed to fetch item details:",
          error?.response?.data || error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);


  if (isLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={theme.colors.text} />
        <ThemedText style={{ marginTop: 10 }}>Loading item...</ThemedText>
      </ThemedView>
    );
  }

  if (!item) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Item not found.</ThemedText>
      </ThemedView>
    );
  }

  const isValidUri = item?.imageUrl && typeof item.imageUrl === 'string' && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('file') || item.imageUrl.startsWith('data:'));


  return (
    <ScrollView showsVerticalScrollIndicator>
      <ThemedView style={styles.container}>
        {isValidUri ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={[
              styles.imageContainer,
              { backgroundColor: theme.colors.card },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imageContainer,
              styles.noImageContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Feather name="image" size={60} color={theme.colors.text} />
          </View>
        )}
        {/* // Display item properties in a card format  - very similar to item edit page*/}
        <View style={styles.fieldsWrap}>
          <FieldCard
            label="Category"
            value={titleCaseFromEnum(item.type)}
            theme={theme}
          />
          <FieldCard
            label="Pattern"
            value={titleCaseFromEnum(item.pattern)}
            theme={theme}
          />
          {item.color && (
            <FieldCard
              label="Color"
              value={titleCaseFromEnum(item.color)}
              theme={theme}
            />
          )}
          <FieldCard
            label="Material"
            value={materialToDisplay(item.material)}
            theme={theme}
          />
          <FieldCard
            label="Formality"
            value={titleCaseFromEnum(item.formality)}
            theme={theme}
          />
          <FieldCard label="Fit" value={fitToDisplay(item.fit)} theme={theme} />
          <FieldCard
            label="Season"
            value={titleCaseFromEnum(item.seasonWear)}
            theme={theme}
          />
          <FieldCard
            label="Length"
            value={titleCaseFromEnum(item.length)}
            theme={theme}
          />
          <FieldCard
            label="Bulk"
            value={titleCaseFromEnum(item.bulk)}
            theme={theme}
          />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  imageContainer: {
    height: 250,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  noImageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  fieldsWrap: {
    width: "100%",
  },
  fieldCard: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 14,
    flexDirection: "row",
  },
  fieldBody: {
    alignItems: "flex-start",
    flexDirection: "column",
  },
  fieldLabel: {
    marginBottom: 2,
  },
  fieldValue: {},
});
