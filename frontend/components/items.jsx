import { FlatList, Pressable, View } from "react-native";
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

  return (
    <>
      <FlatList
        className="items-list"
        data={items} // An array of user items
        keyExtractor={(item) => item.id} // Unique ID for each item
        numColumns="2"
        style={{ marginVertical: 15, paddingHorizontal: 30, width: "100%" }}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 15,
        }}
        ListFooterComponent={listFooterComponent}
        renderItem={({ item }) => (
          <View
            className="item"
            style={{
              borderColor: theme.colors.border,
              // borderWidth: 1,
              backgroundColor: theme.colors.lightBrown,
              borderRadius: 10,
              marginBottom: 20,
              width: "48%",
            }}
          >
            <View
              className="item-image"
              style={{ height: 175, marginBottom: 10 }}
            />
            {/* TO DO: add logic and possible placeholder for when user has no item for image */}
            {/* TO DO: think about if we leave it as squares, do we then render them as rectangles when we open the edit item screen? */}

            <View
              className="item-footer"
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
              <ThemedText>{item.name}</ThemedText>
              <Pressable
                onPress={() => {
                  console.log("pressed item with id: ", item.id);
                  // set the current item id to the id of the item that user wants to edit when they click on the three dots; this is used to pass to the edit item modal so that we know which item user is editing
                  setCurrItemId(item.id);
                  setEditItemsModalVisible(!editItemsModalVisible);
                }}
              >
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
    </>
  );
};
