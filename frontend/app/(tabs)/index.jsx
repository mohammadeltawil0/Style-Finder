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
import WeatherScreen from "../weather/WeatherScreen";

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [editItemsModalVisible, setEditItemsModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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
      // DEBUGGING LOGS FOR API CALL
      const start = Date.now();
      console.log('[least-worn] API call start:', new Date(start).toISOString());
      const response = await apiClient.get(`/api/items/user/${userId}/least-worn`);
      const end = Date.now();
      console.log('[least-worn] API call end:', new Date(end).toISOString(), 'Duration:', (end - start) + 'ms');
      const items = Array.isArray(response?.data) ? response.data : [];

      return items.map((item, index) => ({
        id: String(item?.itemId ?? item?.id ?? index),
        name: item?.type ? String(item.type).replace(/_/g, " ") : "Item",
        imageUrl: item?.imageUrl || null,
      }));
    },
  });

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

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refetchName();
        refetchLeastWorn();
      }
    }, [userId, refetchName, refetchLeastWorn]),
  );

  const handleNavigate = (target) => {
    router.navigate({
      pathname: "/(tabs)/closet",
      params: { tab: target },
    });
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
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
            <View
              className="header-text"
              style={{ flexDirection: "row", width: "100%"}}
            >
              <View style={{ width: "70%" }}>
                <ThemedText
                  style={{
                    fontSize: theme.sizes.h1,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Hello,
                </ThemedText>
                <ThemedText
                  style={{
                    fontSize: theme.sizes.h1,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  {name}!{" "}
                </ThemedText>
              </View>
            </View>
            <View
              className="not-worn-items"
              style={{
                backgroundColor: theme.colors.lightBrown,
                width: "80%",
                borderRadius: 10,
                height: 150,
                justifyContent: "space-between",
                paddingVertical: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.3,
                shadowRadius: 3.5,
                elevation: 5,
                alignSelf: "center",
                paddingHorizontal: 20,
              }}
            >
              <ThemedText
                style={{
                  fontSize: theme.sizes.h3,
                  textAlign: "left",
                }}
              >
                Haven't worn these in a while
              </ThemedText>
              <View
                style={{ justifyContent: "center", flexDirection: "row", gap: 10, marginTop: 8 }}
              >
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
            <View
              className="past-outfits"
              style={{
                backgroundColor: theme.colors.lightBrown,
                borderRadius: 10,
                flexDirection: "row",
                paddingHorizontal: 20,
                paddingVertical: 20,
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.3,
                shadowRadius: 3.5,
                elevation: 5,
                width: "80%",
                alignSelf: "center",
              }}
            >
              <ThemedText
                style={{
                  fontSize: theme.sizes.h3,
                }}
              >
                Look at past outfits
              </ThemedText>
              <AntDesign
                name="right"
                size={24}
                color={theme.colors.card}
                onPress={() => handleNavigate("outfits")}
              // TO DO: create logic where if user has no past outfits vs a grid of past outfits!
              />
            </View>
            <WeatherScreen />
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}
