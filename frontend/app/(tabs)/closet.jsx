import { useCallback, useEffect, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import {
  Pressable,
  View,
  StyleSheet,
  TouchableOpacity,
  mode,
  FlatList,
} from "react-native";
import {
  ClosetToggle,
  Items,
  SearchBar,
  ThemedText,
  ThemedView,
} from "../../components";
import { useTheme } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native";
import { apiClient } from "../../scripts/apiClient";
import EditItemsModal from "../closet/edit-items-modal";


export default function ClosetScreen() {
  const [isItems, setIsItems] = useState(true);
  const [searchText, setSearchText] = useState(""); // state to hold the input when user presses enter
  const [category, setCategory] = useState("all"); // state to hold the selected category
  const [editItemsModalVisible, setEditItemsModalVisible] = useState(false);
  const [currItemId, setCurrItemId] = useState(null); // state to hold the id of the item that user wants to edit when they click on the three dots; this is used to pass to the edit item modal so that we know which item user is editing
  const [mode, setMode] = useState("regular"); // outfit toggle: regular/trip
  const [items, setItems] = useState([]); // state to hold the items fetched from database; for now just have dummy items with no images

  const params = useLocalSearchParams();
  const router = useRouter();

  // Dummy data for outfits and trips
  // TODO: fetch data from database when we have actual data

  // const [outfits, setOutfits] = useState([]);
  // useEffect(() => {
  //   const fetchOutfits = async () => {
  //     setOutfits(data);
  //   };
  //   fetchOutfits();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      // Load or initialize data when the screen is focused
      const loadData = async () => {
        try {
          // Fetch items from the database and set them in state
          // const response = await apiClient.get("/api/items");
          // setItems(response.data);
          const storedUserId = await AsyncStorage.getItem("userId");
          if (!storedUserId) return;

          const userId = Number(storedUserId);
          if (!Number.isInteger(userId) || userId <= 0) {
            console.warn("Invalid stored userId:", storedUserId);
            return; ``
          }

          const response = await apiClient.get(`/api/items/user/${userId}`);
          console.log("User ", userId, "fetched items:", response.data);
          setItems(response.data);
        } catch (e) {
          console.error("Error loading items:", e);
        }
      };
      loadData();
    }, [])
  );

  console.log("Current items in state:", items);
  console.log("Item 0:", items[0], " url", items[0]?.imageUrl);

  const outfits = [
    { id: "o1", name: "Outfit1", items: [{}, {}] },
    { id: "o2", name: "Outfit2", items: [{}] },
    { id: "o3", name: "Outfit3", items: [{}, {}] },
    { id: "o4", name: "Outfit1", items: [{}] },
    { id: "o5", name: "Outfit2", items: [{}, {}] },
    { id: "o5", name: "Outfit3", items: [{}] },
  ];

  const trips = [
    {
      id: "t1",
      name: "NYC Trip",
      dates: "03/01/26 - 03/05/26",
      outfits: [{}, {}, {}, {}, {}, {}],
    },
    {
      id: "t2",
      name: "Beach Trip",
      dates: "04/10/26 - 04/15/26",
      outfits: [{}, {}, {}, {}, {}, {}],
    },
    {
      id: "t3",
      name: "NYC Trip",
      dates: "03/01/26 - 03/05/26",
      outfits: [{}, {}, {}, {}, {}, {}],
    },
    {
      id: "t4",
      name: "Beach Trip",
      dates: "04/10/26 - 04/15/26",
      outfits: [{}, {}, {}, {}, {}, {}],
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const loadTabState = async () => {
        try {
          // navigating in home screen logic
          if (params.tab === "outfits") {
            setIsItems(false);
            await AsyncStorage.setItem("closetTab", "outfits");
            params.tab = null; // clear the param so that it doesn't override future state changes
          } else if (params.tab === "items") {
            setIsItems(true);
            await AsyncStorage.setItem("closetTab", "items");
            params.tab = null; // clear the param so that it doesn't override future state changes
          } else {
            const savedTab = await AsyncStorage.getItem("closetTab");
            setIsItems(savedTab !== "outfits");
          }
        } catch (e) {
          console.error("Error loading tab state:", e);
        }
      };
      loadTabState();
    }, [params.tab]),
  );

  const handleToggleItems = async (value) => {
    setIsItems(value);
    await AsyncStorage.setItem("closetTab", value ? "items" : "outfits");
  };

  const theme = useTheme();
  const handleSearchSubmit = async (e) => {
    console.log("Search submitted with text:", searchText);
    setSearchText("");
    // TO DO: implement search functionality here; for now just log the search text when user presses enter
  };

  // TO DO: implement tops/bottoms/dresses category filtering logic here (probably just set another state variable for category and filter items based on that when rendering)

  return (
    <ThemedView gradient={false} style={{ flex: 1, alignItems: "center" }}>
      <ClosetToggle isItems={isItems} toggleItems={handleToggleItems} />
      <View style={{ flex: 1, width: "100%", alignItems: "center", position: "relative" }}>
        {editItemsModalVisible ? (
          <EditItemsModal
            setModalVisible={setEditItemsModalVisible}
            itemId={currItemId} // pass the id of the item that user wants to edit to the edit item modal
          // maybe add a close modal here
          />
        ) : (
          <View>
            <SearchBar
              value={searchText}
              onChangeText={(text) => setSearchText(text)}
              onSubmit={handleSearchSubmit}
            />
            {isItems ? (
              <>
                <View
                  className="item-categories"
                  style={{
                    flexDirection: "row",
                    gap: 38,
                    justifyContent: "space-between",
                    padding: 15,
                  }}
                >
                  <Pressable
                    className="tops-category"
                    style={{
                      backgroundColor: theme.colors.lightBrown,
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
                  <Pressable
                    className="bottoms-category"
                    style={{
                      backgroundColor: theme.colors.lightBrown,
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
                  <Pressable
                    className="dresses-category"
                    style={{
                      backgroundColor: theme.colors.lightBrown,
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

                <Items
                  items={items}
                  setCurrItemId={setCurrItemId}
                  currItemId={currItemId}
                  setEditItemsModalVisible={setEditItemsModalVisible}
                  editItemsModalVisible={editItemsModalVisible}
                />
                <Pressable
                  style={{
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
            ) : (
              // else outfit history
              <>
                <View style={styles.outfitToggle}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, mode === "trip" && styles.activeToggle]}
                    onPress={() => setMode("trip")}
                  >
                    <ThemedText>Trip</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      mode === "regular" && styles.activeToggle,
                    ]}
                    onPress={() => setMode("regular")}
                  >
                    <ThemedText>Regular</ThemedText>
                  </TouchableOpacity>
                </View>

                {mode === "regular" && (
                  <FlatList
                    className="regularOutfit-list"
                    data={outfits} // An array of user regular outfit TODO: remeber when fetch have array
                    keyExtractor={(outfits) => outfits.id} // Unique ID for outfit
                    numColumns="2"
                    style={{
                      marginVertical: 15,
                      paddingHorizontal: 30,
                      width: "100%",
                    }}
                    columnWrapperStyle={{ justifyContent: "center", gap: 15 }}
                    renderItem={({ item }) => (
                      <View
                        className="regularOufit"
                        style={{
                          borderColor: theme.colors.border,
                          backgroundColor: theme.colors.lightBrown,
                          borderRadius: 10,
                          marginBottom: 20,
                          width: "48%",
                        }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            router.push({
                              pathname: "/closet/outfitsHistory/itemProperty",
                              params: { id: item.id },
                            })
                          }
                        >
                          <View
                            className="outfit-image"
                            style={{ height: 175, marginBottom: 10 }}
                          />
                        </TouchableOpacity>
                        {/* TO DO: add logic and possible placeholder for when user has no outfit image */}
                        {/* TO DO: think about if we leave it as squares, do we then render them as rectangles when we open the edit item screen? */}
                        <View
                          className="outfit-footer"
                          style={{
                            backgroundColor: theme.colors.card,
                            borderBottomLeftRadius: 10,
                            borderBottomRightRadius: 10,
                            borderTopColor: theme.colors.border,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            padding: 10,
                            alignItems: "center",
                          }}
                        >
                          <ThemedText> {item.name} </ThemedText>
                          <Pressable>
                            <Feather
                              name="more-horizontal"
                              size={20}
                              color={theme.colors.text}
                            />
                          </Pressable>
                        </View>
                      </View>
                    )}
                  />
                )}

                {mode === "trip" && (
                  <FlatList
                    className="trip_Oufit_Details"
                    data={trips}
                    keyExtractor={(trip) => trip.id}
                    // TODO: Show two option of UI to Fiona without the comnent style and with the comment styling
                    style={{
                      marginVertical: 15,
                      paddingHorizontal: 30,
                      width: "100%",
                    }}
                    renderItem={({ item }) => (
                      <View className="TripOufit" style={styles.tripCard}>
                        <TouchableOpacity
                          onPress={() =>
                            router.push({
                              pathname: "/closet/outfitsHistory/tripOutfits",
                              params: { id: item.id },
                            })
                          }
                        >
                          <View style={styles.tripHeader}>
                            <View>
                              <ThemedText> {item.name} </ThemedText>
                              <ThemedText>{item.dates}</ThemedText>
                              <ThemedText># Trip</ThemedText>
                            </View>
                            <Ionicons name="ellipsis-horizontal" size={18} />
                          </View>
                        </TouchableOpacity>
                        <View style={styles.previewRow}>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={true}
                          >
                            {item.outfits.map(
                              (
                                outfit,
                                index, // Place Holder only
                              ) => (
                                <View key={index} style={styles.previewBox} />
                              ),
                            )}
                          </ScrollView>
                        </View>
                      </View>
                    )}
                  />
                )}
              </>
            )}
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  tripCard: {
    backgroundColor: "#d6c6b8",
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: "row",
  },
  previewBox: {
    width: 70,
    height: 70,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginRight: 10,
  },
});
