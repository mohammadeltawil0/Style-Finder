import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, View } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { apiClient } from "../../scripts/apiClient";
import OutfitCoverImage from '../closet/outfit-cover-image';

export default function HomeScreen() {
  // TO DO: fetch data for unworn items from backend; for now using mock data to test the UI
  const [unwornItems, setUnwornItems] = useState([
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
    { id: "3", name: "Item 3" },
    { id: "4", name: "Item 4" },
  ]);
  const [pastOutfits, setPastOutfits] = useState([]);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(true);

  const theme = useTheme();
  const router = useRouter();
  const [name, setName] = useState("");

  const loadUserData = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const storedName = await AsyncStorage.getItem("name");

      if (userId) {
        try {
          const response = await apiClient.get(`/api/users/${userId}`);
          const firstName = response?.data?.firstName?.trim();

          if (firstName) {
            setName(firstName);
            await AsyncStorage.setItem("name", firstName);
            return;
          }
        } catch (error) {
          console.error("Error loading first name:", error);
        }
      }

      setName(storedName || "");
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  useEffect(() => {
    loadUserData();
    // Fetch past outfits
    const fetchPastOutfits = async () => {
      setIsLoadingOutfits(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          const response = await apiClient.get(`/api/outfits/user/${userId}/random3`);
          const data = Array.isArray(response?.data) ? response.data : [];  
          const formatted = data.map((outfit) => ({
            ...outfit,
            itemIds:
              outfit.itemIds ||
              (outfit.outfitItems
                ? outfit.outfitItems.map((oi) => oi.item.itemId)
                : []),
          }));
          setPastOutfits(formatted);
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

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData]),
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
          paddingHorizontal: 30,
        }}
      >
        <View
          className="header-text"
          style={{ flexDirection: "row", gap: 10, width: "100%" }}
        >
          <View style={{ width: "70%" }}>
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                fontFamily: theme.fonts.bold,
              }}
            >
              Hello, {name}!{" "}
            </ThemedText>
          </View>
        </View>
        <View
          className="not-worn-items"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            height: 150,
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 3.5,
            elevation: 5,
          }}
        >
          <ThemedText
            style={{
              fontSize: theme.sizes.h3,
              textAlign: "left",
            }}
          >
            You haven't worn these in a while
          </ThemedText>
          <View
            style={{ justifyContent: "center", flexDirection: "row", gap: 10 }}
          >
            {unwornItems.map((item) => (
              <Pressable
                key={item.id}
                style={{
                  backgroundColor: theme.colors.lightBrown,
                  borderRadius: 10,
                  height: 70,
                  width: "22%",
                }}
                onPress={() => console.log("pressed item", item.name)} // TO DO: link this to item details page
              ></Pressable>
            ))}
          </View>
        </View>
        <View
          className="past-outfits"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            paddingHorizontal: 20,
            paddingVertical: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 3.5,
            elevation: 5,
            height: 170,
          }}
        >
          <ThemedText style={{ fontSize: theme.sizes.h3, marginBottom: 10 }}>
            Look at past outfits
          </ThemedText>
          {isLoadingOutfits ? (
            <ThemedText>Loading...</ThemedText>
          ) : pastOutfits.length === 0 ? (
            <ThemedText style={{ opacity: 0.7 }}>
              No past outfits found.
            </ThemedText>
          ) : (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>

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
                {pastOutfits.slice(0, 3).map((item) => (
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
            </View>
          )}
        </View>
        <View
          className="manage-closet"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            paddingHorizontal: 20,
            paddingVertical: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 3.5,
            elevation: 5,
          }}
        >
          <ThemedText
            style={{
              fontSize: theme.sizes.h3,
            }}
          >
            Manage your closet
          </ThemedText>
          <View
            className="manage-closet-options"
            style={{
              flexDirection: "row",
              gap: 20,
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <Pressable
              onPress={() => handleNavigate("items")}
              style={{
                backgroundColor: theme.colors.lightBrown,
                borderRadius: 10,
                paddingVertical: 10,
                width: "45%",
              }}
            >
              <ThemedText
                style={{ color: theme.colors.text, textAlign: "center" }}
              >
                Items
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => handleNavigate("outfits")}
              style={{
                backgroundColor: theme.colors.lightBrown,
                borderRadius: 10,
                paddingVertical: 10,
                width: "45%",
              }}
            >
              <ThemedText
                style={{ color: theme.colors.text, textAlign: "center" }}
              >
                Outfits
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}
