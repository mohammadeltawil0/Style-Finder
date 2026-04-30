import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { ThemedText, ThemedView } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";
import OutfitCoverImage from "../../closet/outfit-cover-image";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const date = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
    );
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  return dateStr;
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const date = new Date(
      parseInt(parts[0]),
      parseInt(parts[1]) - 1,
      parseInt(parts[2]),
    );
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  }
  return dateStr;
};

export default function TripOutfits() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();

  const [trip, setTrip] = useState(null);
  const [outfitsByDay, setOutfitsByDay] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
        if (fetchedDays.length > 0) setCurrentDayIndex(0);
      } catch (error) {
        console.error("Failed to load trip:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTripDetails();
  }, [id]);

  const totalOutfits = outfitsByDay.reduce(
    (acc, d) => acc + (d.outfits?.length || 0),
    0,
  );
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
      
        {/*Top Bar*/}
      <View style={styles.topBar}>
        <ThemedText style={styles.topBarTitle} numberOfLines={1}>
          {trip?.tripLocation || "Trip"}
        </ThemedText>
      </View>
      {/*Trip Summary Strip */}
      <View
        style={[styles.summaryStrip, { backgroundColor: theme.colors.card }]}
      >
        <View style={styles.summaryItem}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={theme.colors.tabIconSelected}
          />
          <ThemedText style={styles.summaryText}>
            {formatDate(trip?.startDate)} — {formatDate(trip?.endDate)}
          </ThemedText>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons
            name="shirt-outline"
            size={16}
            color={theme.colors.tabIconSelected}
          />
          <ThemedText style={styles.summaryText}>
            {totalOutfits} outfit{totalOutfits !== 1 ? "s" : ""}
          </ThemedText>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons
            name="sunny-outline"
            size={16}
            color={theme.colors.tabIconSelected}
          />
          <ThemedText style={styles.summaryText}>
            {outfitsByDay.length} day{outfitsByDay.length !== 1 ? "s" : ""}
          </ThemedText>
        </View>
      </View>

      {/*  Day Navigation  */}
      <View
        style={[styles.dayNav, { backgroundColor: theme.colors.background }]}
      >
        <TouchableOpacity
          onPress={() => setCurrentDayIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentDayIndex === 0}
          style={styles.navArrow}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={currentDayIndex === 0 ? "#ccc" : theme.colors.text}
          />
        </TouchableOpacity>

        <View style={styles.dayInfo}>
          <ThemedText style={styles.dayDateText}>
            {currentDay ? formatDateShort(currentDay.date) : ""}
          </ThemedText>
          <ThemedText style={styles.dayCounterText}>
            Day {currentDayIndex + 1} of {outfitsByDay.length}
          </ThemedText>
        </View>

        <TouchableOpacity
          onPress={() =>
            setCurrentDayIndex((prev) =>
              Math.min(outfitsByDay.length - 1, prev + 1),
            )
          }
          disabled={currentDayIndex === outfitsByDay.length - 1}
          style={styles.navArrow}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={
              currentDayIndex === outfitsByDay.length - 1
                ? "#ccc"
                : theme.colors.text
            }
          />
        </TouchableOpacity>
      </View>

      {/*  Day Dot Indicators  */}
      {outfitsByDay.length > 1 && (
        <View style={styles.dotRow}>
          {outfitsByDay.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentDayIndex(index)}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentDayIndex
                      ? theme.colors.tabIconSelected
                      : "#ddd",
                  width: index === currentDayIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
      )}
 
      {/* Outfit Grid */}
      <ScrollView
        contentContainerStyle={styles.outfitGrid}
        showsVerticalScrollIndicator={false}
      >
        {!currentDay || currentDay.outfits?.length === 0 ? (
          <View style={styles.emptyDay}>
            <Ionicons name="shirt-outline" size={48} color="#ccc" />
            <ThemedText style={{ color: "#aaa", marginTop: 12 }}>
              No outfits for this day
            </ThemedText>
          </View>
        ) : (
          currentDay.outfits.map((outfit, index) => {
            const actualOutfitId = outfit.suggestionId
              ? outfit.suggestionId.replace("trip-outfit-", "")
              : outfit.outfitId;

            return (
              <TouchableOpacity
                key={outfit.suggestionId || outfit.outfitId || index}
                style={[
                  styles.outfitBox,
                  { backgroundColor: theme.colors.card },
                ]}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/closet/outfitsHistory/itemProperty",
                    params: {
                      outfitId: actualOutfitId,
                      isOutfit: "true",
                      source: "trip",
                      tripId: id,
                    },
                  })
                }
              >
                <OutfitCoverImage itemIds={outfit.itemIds || []} height={150} />

                {/* Outfit number badge */}
                <View
                  style={[
                    styles.outfitBadge,
                    { backgroundColor: theme.colors.tabIconSelected },
                  ]}
                >
                  <ThemedText style={styles.outfitBadgeText}>
                    {index + 1}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.outfitCardFooter,
                    { backgroundColor: theme.colors.card },
                  ]}
                >
                  <ThemedText style={styles.outfitCardLabel}>
                    Outfit {index + 1}
                  </ThemedText>
                  <View style={styles.viewChip}>
                    <Ionicons
                      name="eye-outline"
                      size={13}
                      color={theme.colors.tabIconSelected}
                    />
                    <ThemedText
                      style={[
                        styles.viewChipText,
                        { color: theme.colors.tabIconSelected },
                      ]}
                    >
                      View
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    marginTop: "10%",
  },
  topBarBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 8,
  },
  // Summary strip
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: "12%",
  },
  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  summaryText: {
    fontSize: 13,
    fontFamily: "Figtree-Bold",
    fontWeight: "500",
  },
  summaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#ddd",
  },
  // Day navigation
  dayNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  navArrow: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
  },
  dayInfo: {
    alignItems: "center",
    flex: 1,
  },
  dayDateText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  dayCounterText: {
    fontSize: 12,
    color: "#888",
    marginTop: "6%",
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  // Outfit grid
  outfitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
    gap: 12,
    justifyContent: "flex-start",
  },
  outfitBox: {
    width: "47%",
    borderRadius: 14,
    overflow: "hidden",
  },
  outfitBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  outfitBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  outfitCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  outfitCardLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  viewChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyDay: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  // Delete modal
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  confirmCard: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: "10%",
  },
  confirmBody: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
    marginBottom: "20%",
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
});
