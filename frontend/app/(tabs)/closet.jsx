import { useCallback, useEffect, useState } from "react";
import { Pressable, View , StyleSheet, TouchableOpacity, mode, FlatList} from "react-native";
import { ClosetToggle, Items, SearchBar, ThemedText, ThemedView} from "../../components";
import { useTheme } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClosetScreen() {
  const [isItems, setIsItems] = useState(true);
  const [searchText, setSearchText] = useState(""); // state to hold the input when user presses enter
  const [category, setCategory] = useState("all"); // state to hold the selected category
  const params = useLocalSearchParams();

  const router = useRouter();
  const [mode, setMode] = useState("regular"); // outfit toggle: regular/trip

  // Dummy data for outfits and trips 
  // TODO: fetch data from database when we have actual data 
  const outfits = [
    { id: "o1", name: "Outfit1" },
    { id: "o2", name: "Outfit2" },
    { id: "o3", name: "Outfit3" },
  ];
  const trips = [
    { id: "t1", name: "NYC Trip", dates: "03/01/26 - 03/05/26" },
    { id: "t2", name: "Beach Trip", dates: "04/10/26 - 04/15/26" },
    { id: "t3", name: "NYC Trip", dates: "03/01/26 - 03/05/26" },
    { id: "t4", name: "Beach Trip", dates: "04/10/26 - 04/15/26" },
  ];


  useFocusEffect(
    useCallback(() => {
      const loadTabState = async () => {
        try {
          // navigating in home screen logic
          if (params.tab === "outfits") {
            setIsItems(false);
            await AsyncStorage.setItem('closetTab', 'outfits');
            params.tab = null; // clear the param so that it doesn't override future state changes
          } else if (params.tab === "items") {
            setIsItems(true);
            await AsyncStorage.setItem('closetTab', 'items');
            params.tab = null; // clear the param so that it doesn't override future state changes
          } else {
            const savedTab = await AsyncStorage.getItem('closetTab');
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
    await AsyncStorage.setItem('closetTab', value ? 'items' : 'outfits');
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
      <ClosetToggle isItems={isItems} toggleItems={handleToggleItems} />
      <SearchBar
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
        onSubmit={handleSearchSubmit}
      />
      {isItems ? (
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
            onPress={() => router.push("../closet/add-item")} // TO DO: link this to add item page
          >
            <Ionicons name="add-sharp" size={40} color="black" />
          </Pressable>
        </>
        ) :
        ( // outfit history 
          <>
          <View style={styles.outfitToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === "trip" && styles.activeToggle]}
              onPress={() => setMode("trip")}
            >
              <ThemedText>Trip</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, mode === "regular" && styles.activeToggle]}
              onPress={() => setMode("regular")}
            >
              <ThemedText>Regular</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Set up was done 
              TODO: still need to updated card and work with trip outfit and item property
              click card for trip or outift will give error for now 
              This is just the set up 
          */}
          {mode === "regular" && (
            <FlatList
              data={outfits}
              numColumns={2}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.outfitCard}
                  onPress={() => router.push("/screens/outfitsHistory/itemProperty")}
                >
                  <View style={styles.imagePlaceholder} />
                  <ThemedText>{item.name}</ThemedText>
                </TouchableOpacity>
              )}
            />
          )}
          {mode === "trip" && (
            <FlatList
              data={trips}
              numColumns={1}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.outfitCard}
                  onPress={() => router.push("/screens/outfitsHistory/tripOutfits")}
                >
                  <ThemedText style={{ fontWeight: "bold" }}>{item.name}</ThemedText>
                  <ThemedText>{item.dates}</ThemedText>
                </TouchableOpacity>
              )}
            />
          )}
        </>
        )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    backgroundColor: "#b49480",
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
  },
  outfitToggle: {
    flexDirection: "row",
    margin: 15,
    backgroundColor: "#e2d7cd",
    borderRadius: 10,
    alignSelf: "stretch",
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#b49480",
    borderRadius: 10,
  },
  outfitCard: {
    width: "45%",
    margin: 10,
    alignItems: "center",
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: "#d6c6b8",
    borderRadius: 10,
    marginBottom: 5,
    width: "100%",
  },
});