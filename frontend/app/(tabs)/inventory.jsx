import { useState } from "react";
import { Pressable, View } from "react-native";
import { InventoryToggle, Items, SearchBar, ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function InventoryScreen() {
  const [isInventory, setIsInventory] = useState(true);
  const [searchText, setSearchText] = useState(""); // state to hold the input when user presses enter
  const [category, setCategory] = useState("all"); // state to hold the selected category

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
      <InventoryToggle isInventory={isInventory} toggleInventory={setIsInventory} onClick={() => setIsInventory(true)} />
      <SearchBar
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        onSubmit={handleSearchSubmit}
      />
      <View className="item-categories" style={{ flexDirection: "row", gap: 33, justifyContent: "space-between", padding: 15 }}>
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
    </ThemedView>
  );
}
