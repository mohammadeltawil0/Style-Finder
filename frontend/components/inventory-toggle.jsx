import { Text, View, Pressable } from "react-native"; // Add Pressable here
import { useTheme } from "@react-navigation/native";

export const InventoryToggle = ({ isInventory, toggleInventory }) => {
    const theme = useTheme();

    return (
        <View style={{
            backgroundColor: theme.colors.lightBrown, 
            flexDirection: "row", 
            height: 50, 
            width: "100%"
        }}>
            {/* INVENTORY TAB */}
            <Pressable
                onPress={() => toggleInventory(true)}
                style={{ 
                    backgroundColor: isInventory ? theme.colors.tabIconSelected : theme.colors.lightBrown, 
                    flex: 1,               // Automatically takes up 50%
                    justifyContent: "center", 
                    alignItems: "center"   // Centers text perfectly
                }}
            >
                <Text style={{ 
                    color: theme.colors.text, 
                    fontSize: theme.sizes.h3,
                }}>
                    Items
                </Text>
            </Pressable>

            {/* OUTFITS TAB */}
            <Pressable
                onPress={() => toggleInventory(false)}
                style={{ 
                    backgroundColor: !isInventory ? theme.colors.tabIconSelected : theme.colors.lightBrown, 
                    flex: 1, 
                    justifyContent: "center", 
                    alignItems: "center"
                }}
            >
                <Text style={{ 
                    color: theme.colors.text, 
                    fontSize: theme.sizes.h3,
                }}>
                    Outfits
                </Text>
            </Pressable>
        </View>
    );
}