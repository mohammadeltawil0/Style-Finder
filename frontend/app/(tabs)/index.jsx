import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, View } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { apiClient } from "../../scripts/apiClient";
import EditItemsModal from "../closet/edit-items-modal";
import OutfitCoverImage from '../closet/outfit-cover-image';
import WeatherScreen from "../weather/WeatherScreen";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [editItemsModalVisible, setEditItemsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pastOutfits, setPastOutfits] = useState([]);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(true);

  // ✅ All hooks at top level, outside any function
  const {
    data: name = "",
    refetch: refetchName,
  } = useQuery({
    queryKey: ["homeName", userId],
    enabled: !!userId,
    queryFn: async () => {
      const storedName = await AsyncStorage.getItem("name");
      try {
        const response = await apiClient.get(`/api/users/${userId}`);
        const firstName = response?.data?.firstName?.trim();
        if (firstName) {
          await AsyncStorage.setItem("name", firstName);
          return firstName;
        }
      } catch (error) {
        console.error("Error loading first name:", error);
      }
      return storedName || "";
    },
  });

  const {
    data: unwornItems = [],
    isLoading: isUnwornItemsLoading,
    refetch: refetchLeastWorn,
  } = useQuery({
    queryKey: ["leastWornItems", userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await apiClient.get(`/api/items/user/${userId}/least-worn`);
      const items = Array.isArray(response?.data) ? response.data : [];
      return items.map((item, index) => ({
        id: String(item?.itemId ?? item?.id ?? index),
        name: item?.type ? String(item.type).replace(/_/g, " ") : "Item",
        imageUrl: item?.imageUrl || null,
      }));
    },
  });

  // Load userID
  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        const parsedUserId = Number(storedUserId);
        if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
          setUserId(parsedUserId);
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.error("Error loading user id:", error);
        setUserId(null);
      }
    };
    loadUserId();
  }, []);

  // Get 3 random past outfits for the user
  useEffect(() => {
    const fetchPastOutfits = async () => {
      setIsLoadingOutfits(true);
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          const response = await apiClient.get(`/api/outfits/user/${storedUserId}`);
          const data = Array.isArray(response?.data) ? response.data : [];
          const formatted = data.map((outfit) => ({
            ...outfit,
            itemIds:
              outfit.itemIds ||
              (outfit.outfitItems
                ? outfit.outfitItems.map((oi) => oi.item.itemId)
                : []),
          }));
          // shuffle and take 3
          const shuffled = [...formatted].sort(() => Math.random() - 0.5).slice(0, 3);
          setPastOutfits(shuffled);
        } else {
          setPastOutfits([]);
        }
      } catch (error) {
        setPastOutfits([]);
        console.error("Error loading past outfits:", error);
      }
      setIsLoadingOutfits(false);
    };
    fetchPastOutfits();
  }, []);

  // refetch name and least worn
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refetchName();
        refetchLeastWorn();
      }
    }, [userId, refetchName, refetchLeastWorn]),
  );

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30
      }}
    >
      <ThemedView
        gradient={false}
        style={{
          flex: 1,
          gap: 30,
          justifyContent: "center",
        }}
      >
        {editItemsModalVisible ? (
          <EditItemsModal
            item={selectedItem}
            setModalVisible={() => setEditItemsModalVisible(false)}
          />
        ) : (
          <>
            <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
              <View style={{ width: "70%" }}>
                <ThemedText style={{
                  fontSize: theme.sizes.h1,
                  fontFamily: theme.fonts.bold,
                }}>
                  Hello, {name}!{" "}
                </ThemedText>
              </View>
            </View>
            <WeatherScreen />
            {/* Haven't worn */}
            <View style={{
              backgroundColor: theme.colors.lightBrown,
              borderRadius: 10,
              height: 150,
              justifyContent: "space-between",
              paddingVertical: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 3.5,
              elevation: 5,
              alignSelf: "stretch",
              paddingHorizontal: 20,
            }}>
              <ThemedText style={{ fontSize: theme.sizes.h3, textAlign: "left" }}>
                Haven't worn these in a while
              </ThemedText>
              <View style={{ justifyContent: "center", flexDirection: "row", gap: 10, marginTop: 8 }}>
                {isUnwornItemsLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.tabIconSelected} />
                ) : unwornItems.length === 0 ? (
                  <ThemedText style={{ opacity: 0.7 }}>No items found.</ThemedText>
                ) : (
                  unwornItems.map((item) => (
                    <Pressable
                      key={item.id}
                      style={{
                        backgroundColor: theme.colors.lightBrown,
                        borderRadius: 10,
                        height: "90%",
                        width: "30%",
                        overflow: "hidden",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() => {
                        setSelectedItem(item);
                        setEditItemsModalVisible(true);
                      }}
                    >
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <ThemedText style={{ fontSize: 11, textAlign: "center", paddingHorizontal: 4 }}>
                          {item.name}
                        </ThemedText>
                      )}
                    </Pressable>
                  ))
                )}
              </View>
            </View>

            {/* Past outfits */}
            <View style={{
              backgroundColor: theme.colors.lightBrown,
              borderRadius: 10,
              paddingHorizontal: 20,
              paddingVertical: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 3.5,
              elevation: 5,
              height: (isLoadingOutfits || pastOutfits.length == 0) ? 90 : 170, 
              alignSelf: "stretch",
            }}>
              <ThemedText style={{ fontSize: theme.sizes.h3, marginBottom: 10 }}>
                Look at past outfits
              </ThemedText>
              {isLoadingOutfits ? (
                <ActivityIndicator size="small" color={theme.colors.tabIconSelected} />
              ) : pastOutfits.length === 0 ? (
                <ThemedText style={{ opacity: 0.7 }}>No past outfits found. Go generate some!</ThemedText>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {pastOutfits.map((item) => (
                    <Pressable
                      key={String(item.outfitId || item.id)}
                      style={{ width: 90, height: 90 }}
                      onPress={() => router.navigate({
                        pathname: "/(tabs)/closet",
                        params: {
                          tab: "outfits",
                          openOutfitId: String(item.outfitId || item.id)
                        }
                      })}
                    >
                      <OutfitCoverImage
                        itemIds={item.itemIds || []}
                        height={90}
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}