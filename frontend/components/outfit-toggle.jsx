import { View, Pressable } from "react-native"; // Add Pressable here
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "./themed-text";

export const OutfitToggle = ({ isRegularOutfit, toggleOutfit }) => {
    const theme = useTheme();

    return (
        <View style={{
            backgroundColor: theme.colors.lightBrown, 
            flexDirection: "row", 
            height: 50, 
            width: "100%"
        }}>
            {/* CLOSET TAB */}
            <Pressable
                onPress={() => toggleOutfit(true)}
                style={{ 
                    backgroundColor: isRegularOutfit ? theme.colors.tabIconSelected : theme.colors.lightBrown, 
                    flex: 1,               // Automatically takes up 50%
                    justifyContent: "center", 
                    alignItems: "center"   // Centers text perfectly
                }}
            >
                <ThemedText style={{ 
                    color: theme.colors.text, 
                    fontSize: theme.sizes.h3,
                }}>
                    Regular Outfit
                </ThemedText>
            </Pressable>

            {/* OUTFITS TAB */}
            <Pressable
                onPress={() => toggleOutfit(false)}
                style={{ 
                    backgroundColor: !isRegularOutfit ? theme.colors.tabIconSelected : theme.colors.lightBrown, 
                    flex: 1, 
                    justifyContent: "center", 
                    alignItems: "center"
                }}
            >
                <ThemedText style={{ 
                    color: theme.colors.text, 
                    fontSize: theme.sizes.h3,
                }}>
                    Trip Outfits
                </ThemedText>
            </Pressable>
        </View>
    );
}