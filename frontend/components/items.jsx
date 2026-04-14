import { FlatList, View, TouchableOpacity, Image } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "./themed-text";
import { useRouter } from "expo-router";

export const Items = ({ items }) => {
    const theme = useTheme();
    const router = useRouter();

    return (
        <>
            <FlatList
                className="items-list"
                data={items}
                keyExtractor={(item) => item.id.toString()}
                numColumns="2"
                style={{ marginVertical: 15, paddingHorizontal: 30, width: "100%" }}
                columnWrapperStyle={{
                    justifyContent: "center",
                    gap: 15,
                }}
                renderItem={({ item }) => (
                    <View
                        className="item"
                        style={{
                            borderColor: theme.colors.border,
                            backgroundColor: theme.colors.lightBrown,
                            borderRadius: 10,
                            marginBottom: 20,
                            width: "48%",
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: "/closet/outfitsHistory/itemProperty",
                                params: { id: item.id }
                            })}
                        >
                            {item.imageUrl ? (
                                <Image
                                    source={{ uri: item.imageUrl }}
                                    style={{ height: 175, width: "100%", borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View
                                    className="item-image"
                                    style={{ height: 175, marginBottom: 10, backgroundColor: theme.colors.card, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                                />
                            )}
                        </TouchableOpacity>

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
                        </View>
                    </View>
                )}
            />
        </>
    );
};