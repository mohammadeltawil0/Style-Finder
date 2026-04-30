import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";
import OutfitCoverImage from "../../closet/outfit-cover-image";

export default function TripOutfits() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [trip, setTrip] = useState(null);
  const [outfitsByDay, setOutfitsByDay] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [isDeletingTrip, setIsDeletingTrip] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await apiClient.get(`/api/trips/${id}`);
        const tripData = res.data;

        setTrip(tripData);

        const fetchedDays = tripData.days || [];
        setOutfitsByDay(fetchedDays);

        // 🟢 CORRECTED FIX: Reset the carousel index to the first day (Day 0)
        if (fetchedDays.length > 0) {
          setCurrentDayIndex(0);
        }

      } catch (error) {
        console.error("Failed to load trip:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");

    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);

      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    }
  };

  const currentDay = outfitsByDay[currentDayIndex];

  if (isLoading) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={theme.colors.tabIconSelected} />
        <ThemedText style={{ marginTop: 10 }}>Loading trip...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Trip Info */}
      <View style={styles.tripInfo}>
        <ThemedText style={styles.tripName}>
          {trip?.tripLocation || "Trip"}
        </ThemedText>
        <View style={styles.tripMeta}>
          <ThemedText style={styles.tripDates}>
            {formatDate(trip?.startDate)} - {formatDate(trip?.endDate)}
          </ThemedText>
          <ThemedText style={styles.outfitCount}>
            {outfitsByDay.reduce((acc, d) => acc + d.outfits.length, 0)} Outfits
          </ThemedText>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Day navigation with outfit grid */}
      <View style={{ flex: 1 }}>
        {/* Outfit Grid */}
        <ScrollView contentContainerStyle={styles.outfitGrid}>
          {currentDay?.outfits.map((outfit, index) => {

            const actualOutfitId = outfit.suggestionId
                ? outfit.suggestionId.replace("trip-outfit-", "")
                : outfit.outfitId;
            return (
                <TouchableOpacity
                    key={outfit.suggestionId || index}
                    style={styles.outfitBox}
                    onPress={() => {
                      // 🟢 RESTORED: Route directly to itemProperty
                      router.push({
                        pathname: "/closet/outfitsHistory/itemProperty",
                        params: {
                          outfitId: actualOutfitId,
                          isOutfit: "true",
                        },
                      });
                    }}
                >
                  <OutfitCoverImage
                      itemIds={outfit.itemIds || []}
                      height={"100%"}
                  />
                </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Date + arrows */}
        <View style={styles.dayNav}>
          <TouchableOpacity
            onPress={() => setCurrentDayIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentDayIndex === 0}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={currentDayIndex === 0 ? "#ccc" : theme.colors.text}
            />
          </TouchableOpacity>

          <View style={styles.dayInfo}>
            <ThemedText style={styles.dateText}>
              {currentDay ? formatDate(currentDay.date) : ""}
            </ThemedText>
            <ThemedText style={styles.descriptionLabel}>Description</ThemedText>
          </View>

          <TouchableOpacity
            onPress={() =>
              setCurrentDayIndex((prev) =>
                Math.min(outfitsByDay.length - 1, prev + 1),
              )
            }
            disabled={currentDayIndex === outfitsByDay.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={28}
              color={
                currentDayIndex === outfitsByDay.length - 1
                  ? "#ccc"
                  : theme.colors.text
              }
            />
          </TouchableOpacity>
        </View>

        {/* Bottom buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() =>
              router.push({
                pathname: "/closet/outfitsHistory/itemProperty",
                params: {
                  outfitId: currentDay?.outfits?.[0]?.outfitId,
                  isOutfit: "true",
                },
              })
            }
          >
            <ThemedText>View Items</ThemedText>
          </TouchableOpacity>
        
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  tripInfo: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  tripName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  tripMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  tripDates: {
    fontSize: 13,
    color: "#888",
  },
  outfitCount: {
    fontSize: 13,
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  outfitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
    justifyContent: "flex-start",
  },
  outfitBox: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#d6c6b8",
    overflow: "hidden",
  },
  outfitImage: {
    width: "100%",
    height: "100%",
  },
  outfitImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#d6c6b8",
  },
  dayNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dayInfo: {
    alignItems: "center",
    flex: 1,
  },
  dateText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  descriptionLabel: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  btn: {
    flex: 1,
    backgroundColor: "#e2d7cd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  actionsCard: {
    width: "80%",
    borderRadius: 14,
    padding: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  actionText: {
    fontSize: 15,
  },
  actionDivider: {
    height: 1,
    backgroundColor: "#eee",
  },
  confirmCard: {
    width: "100%",
    borderRadius: 16,
    padding: 18,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  confirmText: {
    marginBottom: 16,
    lineHeight: 20,
    color: "#666",
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
});