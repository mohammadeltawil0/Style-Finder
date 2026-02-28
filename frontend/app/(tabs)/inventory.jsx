import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { InventoryToggle, Items, SearchBar, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function InventoryScreen() {
  const [isInventory, setIsInventory] = useState(true);
  const [searchText, setSearchText] = useState(""); // state to hold the input when user presses enter
  const [category, setCategory] = useState("all"); // state to hold the selected category

  const theme = useTheme();

  // TO DO: implement tops/bottoms/dresses category filtering logic here (probably just set another state variable for category and filter items based on that when rendering)

  return (
    <ThemedView
      gradient={false}
      style={{ flex: 1, alignItems: "center" }}
    >
      <InventoryToggle isInventory={isInventory} toggleInventory={setIsInventory} onClick={() => setIsInventory(true)} />
      <SearchBar
        value={searchText}
        onChangeText={(text) => { setSearchText(text); console.log("Searching for:", text); }}
      // TO DO: implement setSearchText("") to clear after search is submitted
      />
      <View className="item-categories" style={{ flexDirection: "row", gap: 33, justifyContent: "space-between", padding: 15 }}>
        <Pressable className="tops-category" style={{ backgroundColor: theme.colors.lightBrown, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }} onPress={() => setCategory("tops")}>
          <Text style={{ color: theme.colors.text, fontSize: theme.sizes.text }}>Tops</Text>
        </Pressable>
        <Pressable className="bottoms-category" style={{ backgroundColor: theme.colors.lightBrown, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }} onPress={() => setCategory("bottoms")}>
          <Text style={{ color: theme.colors.text, fontSize: theme.sizes.text }}>Bottoms</Text>
        </Pressable>
        <Pressable className="dresses-category" style={{ backgroundColor: theme.colors.lightBrown, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }} onPress={() => setCategory("dresses")}>
          <Text style={{ color: theme.colors.text, fontSize: theme.sizes.text }}>Dresses</Text>
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
