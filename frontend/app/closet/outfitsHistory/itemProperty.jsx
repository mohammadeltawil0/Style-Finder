import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, Image } from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";
import { useTheme } from "@react-navigation/native";
import EditItemsModal from "../edit-items-modal";

// Helper to format backend Enums (e.g. "FULL_BODY" -> "Full Body", "PARTY_OR_NIGHT_OUT" -> "Party / Night Out")
const formatEnum = (str) => {
  if (!str) return "";
  let cleanStr = str.replace(/_OR_/g, " / ");
  cleanStr = cleanStr.replace(/_/g, " ");
  return cleanStr.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// Material mapping to match the frontend selection options
const materialMap = {
  1: "Cotton", 2: "Linen/Hemp", 3: "Wool/Fleece", 4: "Silk/Satin",
  5: "Leather/Faux Leather", 6: "Synthetics", 7: "Other"
};

export default function ItemProperty() {

  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams();

  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State to control the Edit Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Fetch the item data from the database
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/api/items/${id}`);
        if (response.status === 200) {
          setItem(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch item details:", error?.response?.data || error);
      } finally {
        setIsLoading(false);
      }
    };

        if (id) {
      fetchItem();
    }
  }, [id, isEditModalVisible]); // Re-fetch if the modal closes in case data was updated!

  if (isLoading) {
    return (
        <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.text} />
          <ThemedText style={{ marginTop: 10 }}>Loading Item Details...</ThemedText>
        </ThemedView>
    );
  }

  if (!item) {
    return (
        <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ThemedText>Item not found.</ThemedText>
          <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={() => router.back()}>
            <ThemedText>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
    );
  }
    
  return (
    <>
      <ScrollView showsVerticalScrollIndicator={true}>
        <ThemedView>
          {item?.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.imagePlaceholder} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}


            <View style={styles.info}>
              <ThemedText style={styles.title}>{formatEnum(item.type)}</ThemedText>

              <ThemedText style={styles.label}>Description:</ThemedText>
              <ThemedText style={{ marginTop: 4 }}>
                A {item.color ? item.color.toLowerCase() : ""} {formatEnum(item.fit)} fit {formatEnum(item.type).toLowerCase()} with a {formatEnum(item.pattern)} pattern, perfect for {formatEnum(item.formality).toLowerCase()} occasions.
              </ThemedText>

              <ThemedText style={styles.label}>Tags:</ThemedText>
              <View style={styles.tags}>
                {item.color &&
                    <View style={styles.tag}>
                      <ThemedText>{formatEnum(item.color)}</ThemedText>
                    </View>}
                {item.pattern &&
                    <View style={styles.tag}>
                      <ThemedText>{formatEnum(item.pattern)}</ThemedText>
                    </View>}
                {item.formality &&
                    <View style={styles.tag}>
                      <ThemedText>{formatEnum(item.formality)}</ThemedText>
                    </View>}
                {item.seasonWear &&
                    <View style={styles.tag}>
                      <ThemedText>{formatEnum(item.seasonWear)}</ThemedText>
                    </View>}
                {item.fit &&
                    <View style={styles.tag}>
                      <ThemedText>{formatEnum(item.fit)} Fit</ThemedText>
                    </View>}
                {item.material && materialMap[item.material] &&
                    <View style={styles.tag}>
                      <ThemedText>{materialMap[item.material]}</ThemedText>
                    </View>}
                {item.length &&
                    <View style={styles.tag}>
                      <ThemedText>{formatEnum(item.length)}</ThemedText>
                    </View>}
              </View>

              <View style={styles.buttons}>
                {/* Edit Button triggers modal */}
                <TouchableOpacity style={styles.btn} onPress={() => setIsEditModalVisible(true)}>
                  <ThemedText>Edit Item</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ThemedView>
      </ScrollView>
      {isEditModalVisible && (
        <EditItemsModal setModalVisible={setIsEditModalVisible} itemId={id} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  imagePlaceholder: {
    height: 250,
    margin: 20,
    borderRadius: 14,
    backgroundColor: "#d6c6b8",
  },
  info: {
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: "bold",
    fontSize: 22,
    marginBottom: 10,
  },
  label: {
    marginTop: 15,
    fontWeight: "bold",
    fontSize: 16,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#e2d7cd",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  btn: {
    backgroundColor: "#e2d7cd",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    flex: 0.48,
  },
});