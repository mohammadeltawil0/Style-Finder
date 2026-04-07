import { FlatList, Image, Pressable, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "./themed-text";

export const Items = ({
  items,
  setCurrItemId,
  currItemId,
  setEditItemsModalVisible,
  editItemsModalVisible,
  listFooterComponent,
}) => {
  const theme = useTheme();
  const paddedItems = items.length % 2 !== 0 ? [...items, { id: "empty", isEmpty: true }] : items;
  return (
    <>
      <FlatList
        className="items-list"
        data={paddedItems} // An array of user items
        keyExtractor={(item, index) =>
          item?.itemId != null ? String(item.itemId) : item?.id != null ? String(item.id) : `item-${index}`
        }
        numColumns={2} // Display items in a grid with 2 columns
        style={{ marginVertical: 15, paddingHorizontal: 30, width: "100%" }}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 15,
        }}
        renderItem={({ item }) => {
          if (item.isEmpty) {
            return <View style={{ width: "48%" }} />;
          }
          return (
            <View
              className="item"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.lightBrown,
                borderRadius: 10,
                marginBottom: 20, // space between rows
                overflow: "hidden", // clips image to borderRadius
                width: "48%",
              }}
            >
              <View className="item-image" style={{ height: 175 }}>
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather name="image" size={40} color={theme.colors.text} />
                  </View>
                )}
              </View>

              <View
                className="item-footer"
                style={{
                  backgroundColor: theme.colors.card,
                  borderTopColor: theme.colors.border,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  padding: 10,
                  alignItems: "center",
                }}
              >
                {/* <ThemedText>{item.name}</ThemedText> */}
                <Pressable
                  onPress={() => {
                    setCurrItemId(item.itemId);
                    setEditItemsModalVisible(!editItemsModalVisible);
                  }}
                >
                  <Feather name="more-horizontal" size={20} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>
          )
        }}
      />
    </>
  );
};
