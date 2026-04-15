import { FlatList, Image, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useTheme } from "@react-navigation/native";
import { FontAwesome6 } from "@expo/vector-icons";

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
            <TouchableOpacity
              className="item"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.lightBrown,
                borderRadius: 10,
                marginBottom: 20, // space between rows
                overflow: "hidden", // clips image to borderRadius
                width: "48%",
              }}
              onPress={() => {
                setCurrItemId(item.itemId);
                setEditItemsModalVisible(!editItemsModalVisible);
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
                style={{
                  position: "absolute",
                  right: 6,
                  top: 6,
                  borderRadius: 12,
                  padding: 4,
                  backgroundColor: theme.colors.background,
                }}
              >
                <Feather name="more-horizontal" size={16} color={theme.colors.text} />
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </>
  );
};
