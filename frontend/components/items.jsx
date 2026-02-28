import { FlatList, Pressable, View } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "./themed-text";
export const Items = ({ category }) => {
    const theme = useTheme();

    // TO DO: get all the items based on category; for now just have 4 dummy items with no images
    const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
        { id: '4', name: 'Item 4' },
        { id: '5', name: 'Item 5' },
        { id: '6', name: 'Item 6' },
    ];

    return (
        <FlatList
            className="items-list"
            data={items} // An array of user items
            keyExtractor={(item) => item.id} // Unique ID for each item
            numColumns="2"
            style={{ marginVertical: 15, paddingHorizontal: 30, width: "100%" }}
            columnWrapperStyle={{
                justifyContent: 'center',
                gap: 15 
            }}
            renderItem={({ item }) => (
                <View className="item" style={{ backgroundColor: theme.colors.lightBrown, padding: 20, borderRadius: 10, marginBottom: 20, width: "48%" }}>
                    <View className="item-image" style={{ height: 150, marginBottom: 10 }} />
                    {/* TO DO: add logic and possible placeholder for when user has no item for image */}
                    {/* TO DO: think about if we leave it as squares, do we then render them as rectangles when we open the edit item screen? */}

                    <View className="item-footer" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <ThemedText>
                            {item.name}
                        </ThemedText>
                        <Pressable>
                            <Feather name="more-horizontal" size={20} color={theme.colors.text} />
                        </Pressable>
                    </View>
                </View>)} />
    );
}