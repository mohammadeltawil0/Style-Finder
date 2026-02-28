import { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { InventoryToggle, Items, SearchBar, ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InventoryScreen() {
  const [isItems, setIsItems] = useState(true);
  const [searchText, setSearchText] = useState(""); // state to hold the input when user presses enter
  const [category, setCategory] = useState("all"); // state to hold the selected category
  const params = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      const loadTabState = async () => {
        try {
          // navigating in home screen logic
          if (params.tab === "outfits") {
            setIsItems(false);
            await AsyncStorage.setItem('inventoryTab', 'outfits');
            params.tab = null; // clear the param so that it doesn't override future state changes
          } else if (params.tab === "items") {
            setIsItems(true);
            await AsyncStorage.setItem('inventoryTab', 'items');
            params.tab = null; // clear the param so that it doesn't override future state changes
          } else {
            const savedTab = await AsyncStorage.getItem('inventoryTab');
            setIsItems(savedTab !== 'outfits');
          }
        } catch (e) {
          console.error('Error loading tab state:', e);
        }
      };
      loadTabState();
    }, [params.tab])
  );

  const handleToggleItems = async (value) => {
    setIsItems(value);
    await AsyncStorage.setItem('inventoryTab', value ? 'items' : 'outfits');
  };

  const theme = useTheme();
  const handleSearchSubmit = () => {
    console.log("Search submitted with text:", searchText);
    setSearchText("");
    // TO DO: implement search functionality here; for now just log the search text when user presses enter
  }

  // TO DO: implement tops/bottoms/dresses category filtering logic here (probably just set another state variable for category and filter items based on that when rendering)

  return (
    <ThemedView
      gradient={false}
      style={{ flex: 1, alignItems: "center" }}
    >
      <InventoryToggle isItems={isItems} toggleItems={handleToggleItems} />
      <SearchBar
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        onSubmit={handleSearchSubmit}
      />
      {isItems && (
        <>
          <View className="item-categories" style={{ flexDirection: "row", gap: 38, justifyContent: "space-between", padding: 15 }}>
            <Pressable className="tops-category" style={{ backgroundColor: theme.colors.lightBrown, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }} onPress={() => setCategory("tops")}>
              <ThemedText style={{ color: theme.colors.text, fontSize: theme.sizes.text }}>Tops</ThemedText>
            </Pressable>
            <Pressable className="bottoms-category" style={{ backgroundColor: theme.colors.lightBrown, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }} onPress={() => setCategory("bottoms")}>
              <ThemedText style={{ color: theme.colors.text, fontSize: theme.sizes.text }}>Bottoms</ThemedText>
            </Pressable>
            <Pressable className="dresses-category" style={{ backgroundColor: theme.colors.lightBrown, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }} onPress={() => setCategory("dresses")}>
              <ThemedText style={{ color: theme.colors.text, fontSize: theme.sizes.text }}>Dresses</ThemedText>
            </Pressable>
          </View>

          <Items category={category} />
          <Pressable style={{
            backgroundColor: theme.colors.tabIconSelected,
            borderRadius: 100,
            bottom: 30,
            padding: 5,
            position: "absolute",
            right: 30,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 3.84,
            elevation: 5,
          }}
            onPress={() => console.log("Add new item")} // TO DO: link this to add item page
          >
            <Ionicons name="add-sharp" size={40} color="black" />
          </Pressable>
        </>
      )
      }
    </ThemedView>
  );
}
