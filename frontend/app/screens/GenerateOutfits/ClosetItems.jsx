import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Items, SearchBar, ThemedText, ThemedView } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";

export default function ClosetItems() {
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("all");

  const params = useLocalSearchParams();
  const router = useRouter();
  const replaceType = params.type?.toString().toUpperCase() || "ALL";

  

  const fetchItems = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    if (!storedUserId) return [];
    const userId = Number(storedUserId);
    if (!Number.isInteger(userId) || userId <= 0) return [];
    const response = await apiClient.get(`/api/items/user/${userId}`);
    return response.data;
  };

  const {
    data: items = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const theme = useTheme();
  const handleSearchSubmit = async (e) => {
    console.log("Search submitted with text:", searchText);
    setSearchText("");
  };

  const filteredItems = items.filter((item) => {
    if (replaceType !== "ALL" && item.type !== replaceType) return false;
    if (category === "all") return true;
    if (category === "tops" && item.type === "TOP") return true;
    if (category === "bottoms" && item.type === "BOTTOM") return true;
    if (category === "dresses" && item.type === "FULL_BODY") return true;
    return false;
  });

  const onItemSelect = async (item) => {
    // Store selected item in AsyncStorage for EditOutfit to pick up
    await AsyncStorage.setItem("selectedReplacementItem", JSON.stringify(item));
    router.back();
  };

  //   // Dummy data for testing
  // const dummyItems = [
  //   {
  //     id: 1,
  //     name: "Blue T-Shirt",
  //     type: "TOP",
  //     imageUrl: require("../../../assets/images/custom-logo.png"),
  //   },
  //   {
  //     id: 2,
  //     name: "Black Jeans",
  //     type: "BOTTOM",
  //     imageUrl: require("../../../assets/images/custom-logo-2.png"),
  //   },
  //   {
  //     id: 3,
  //     name: "Red Dress",
  //     type: "FULL_BODY",
  //     imageUrl: require("../../../assets/images/logo.png"),
  //   },
  //   {
  //     id: 4,
  //     name: "White Sneakers",
  //     type: "BOTTOM", // Assuming shoes are bottom for now
  //     imageUrl: require("../../../assets/images/placeholder.png"),
  //   },
  //   {
  //     id: 5,
  //     name: "Green Jacket",
  //     type: "OUTERWEAR",
  //     imageUrl: require("../../../assets/images/custom-logo.png"),
  //   },
  //   {
  //     id: 6,
  //     name: "Gray Hoodie",
  //     type: "TOP",
  //     imageUrl: require("../../../assets/images/custom-logo-2.png"),
  //   },
  // ];

  // //  dummy data 
  // const items = dummyItems;

  return (
    <ThemedView gradient={false} style={{ flex: 1, alignItems: "center" }}>
      <View
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
          position: "relative",
        }}
      >
        <View style={{ width: "100%" }}>
          {/* TODO: Remove search if not needed it  */}
          <SearchBar
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
            onSubmit={handleSearchSubmit}
          />

          <View
            className="item-categories"
            style={{
              flexDirection: "row",
              gap: 10,
              justifyContent: "center",
              padding: 15,
            }}
          >
            {/* TOP */}
            <Pressable
              className="tops-category"
              style={{
                backgroundColor:
                  category === "tops"
                    ? theme.colors.tabIconSelected
                    : theme.colors.lightBrown,
                borderRadius: 10,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
              onPress={() => setCategory("tops")}
            >
              <ThemedText
                style={{ color: theme.colors.text, fontSize: theme.sizes.text }}
              >
                Tops
              </ThemedText>
            </Pressable>

            {/* BOTTOM */}
            <Pressable
              className="bottoms-category"
              style={{
                backgroundColor:
                  category === "bottoms"
                    ? theme.colors.tabIconSelected
                    : theme.colors.lightBrown,
                borderRadius: 10,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
              onPress={() => setCategory("bottoms")}
            >
              <ThemedText
                style={{ color: theme.colors.text, fontSize: theme.sizes.text }}
              >
                Bottoms
              </ThemedText>
            </Pressable>

            {/* DRESS */}
            <Pressable
              className="dresses-category"
              style={{
                backgroundColor:
                  category === "dresses"
                    ? theme.colors.tabIconSelected
                    : theme.colors.lightBrown,
                borderRadius: 10,
                paddingHorizontal: 20,
                paddingVertical: 10,
              }}
              onPress={() => setCategory("dresses")}
            >
              <ThemedText
                style={{ color: theme.colors.text, fontSize: theme.sizes.text }}
              >
                Dresses
              </ThemedText>
            </Pressable>
          </View>

          <Items items={filteredItems} onItemSelect={onItemSelect} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
});
