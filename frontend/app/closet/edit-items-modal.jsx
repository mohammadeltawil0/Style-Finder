import { ActivityIndicator, Pressable, ScrollView, View, Image } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "../../components";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "../../scripts/apiClient";

// Formatting helper for Backend Enums
const formatEnum = (str) => {
    if (!str) return null;
    let cleanStr = str.replace(/_OR_/g, " / ").replace(/_/g, " ");
    return cleanStr.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// Material mapping for Backend Enum strings to UI text
const materialMapStr = {
    COTTON: "Cotton", LINEN: "Linen/Hemp", WOOL: "Wool/Fleece",
    SILK: "Silk/Satin", LEATHER: "Leather/Faux Leather",
    POLYESTER: "Synthetics", ACRYLIC: "Other"
};

export default function EditItemsModal({ setModalVisible, itemId }) {
    const theme = useTheme();

    const [item, setItem] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch the real item data on modal load
    useEffect(() => {
        const fetchItemData = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get(`/api/items/${itemId}`);
                if (response.status === 200) {
                    setItem(response.data);
                }
            } catch (error) {
                console.error("Failed to load item for editing:", error?.response?.data || error);
            } finally {
                setIsLoading(false);
            }
        };

        if (itemId) fetchItemData();
    }, [itemId]);

    if (isLoading || !item) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.text} />
                <ThemedText style={{ marginTop: 10 }}>Loading editor...</ThemedText>
            </View>
        );
    }

    // Safely extract and format variables for the UI
    const uri = item.imageUrl;
    const categoryVal = item.type ? formatEnum(item.type) : "Not specified";
    const patternVal = item.pattern ? formatEnum(item.pattern) : "Not specified";
    const colorVal = item.color;
    const eventVal = item.formality ? formatEnum(item.formality) : "Not specified";
    const fitVal = item.fit ? formatEnum(item.fit) : "Not specified";
    const materialVal = item.material ? (materialMapStr[item.material] || formatEnum(item.material)) : "Not specified";
    const seasonVal = item.seasonWear ? formatEnum(item.seasonWear) : null;
    const lengthVal = item.length ? formatEnum(item.length) : null;
    const bulkVal = item.bulk <= 0.5 ? "Thin" : item.bulk <= 1.4 ? "Regular" : item.bulk >+ 1.5 ? "Thick" : null;

    return (
        <>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "stretch", width: "100%" }}>
                    <View className="chevronView" style={styles.chevronView}>
                        <Pressable onPress={() => setModalVisible(false)} style={{ width: 30, height: 30 }}>
                            <Entypo name="chevron-left" size={30} color={theme.colors.text} />
                        </Pressable>
                    </View>

                    {/* NEW CONSISTENT IMAGE PLACEHOLDER */}
                    {uri ? (
                        <Image
                            source={{ uri: uri }}
                            style={styles.imagePlaceholder}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.imagePlaceholder, { justifyContent: "center", alignItems: "center" }]}>
                            <ThemedText style={{ textAlign: "center", color: theme.colors.text }}>
                                No image preview available yet.
                            </ThemedText>
                        </View>
                    )}

                    {/* CATEGORY */}
                    <View style={[styles.responseContainer, { backgroundColor: theme.colors.card }]}>
                        <View style={{ alignItems: "flex-start", flexDirection: "column" }}>
                            <ThemedText style={[styles.titleText, { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 }]}>Category:</ThemedText>
                            <ThemedText style={[styles.answerText, { fontFamily: theme.fonts.regular, fontSize: theme.sizes.text }]}>{categoryVal}</ThemedText>
                        </View>
                        <View style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}>
                            <Ionicons name="create" size={20} color={theme.colors.text} />
                        </View>
                    </View>

                    {/* PATTERN */}
                    <View style={[styles.responseContainer, { backgroundColor: theme.colors.card }]}>
                        <View style={{ alignItems: "flex-start", flexDirection: "column", width: "70%" }}>
                            <ThemedText style={[styles.titleText, { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 }]}>Pattern:</ThemedText>
                            <ThemedText style={[styles.answerText, { fontFamily: theme.fonts.regular, fontSize: theme.sizes.text }]}>{patternVal}</ThemedText>
                        </View>
                        {!colorVal && (
                            <View style={{ flexGrow: 1, alignItems: "flex-end" }}>
                                <Ionicons name="create" size={20} color={theme.colors.text} />
                            </View>
                        )}
                    </View>

                    {/* COLOR */}
                    {colorVal && (
                        <View style={[styles.responseContainer, { backgroundColor: theme.colors.card }]}>
                            <View style={{ alignItems: "flex-start", flexDirection: "column", width: "70%" }}>
                                <ThemedText style={[styles.titleText, { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 }]}>Color:</ThemedText>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                    <View style={{ backgroundColor: colorVal, width: 30, height: 30, borderRadius: 25, padding: 0 }}></View>
                                    <ThemedText style={{ fontFamily: theme.fonts.regular, fontSize: theme.sizes.text, margin: 0 }}>{colorVal}</ThemedText>
                                </View>
                            </View>
                            <View style={{ flexGrow: 1, alignItems: "flex-end" }}>
                                <Ionicons name="create" size={20} color={theme.colors.text} />
                            </View>
                        </View>
                    )}

                    {/* EVENT (Formality) */}
                    <View style={[styles.responseContainer, { backgroundColor: theme.colors.card }]}>
                        <View style={{ alignItems: "flex-start", flexDirection: "column", width: "70%" }}>
                            <ThemedText style={[styles.titleText, { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 }]}>Event:</ThemedText>
                            <ThemedText style={[styles.answerText, { fontFamily: theme.fonts.regular, fontSize: theme.sizes.text }]}>{eventVal}</ThemedText>
                        </View>
                        <View style={{ flexGrow: 1, alignItems: "flex-end" }}>
                            <Ionicons name="create" size={20} color={theme.colors.text} />
                        </View>
                    </View>

                    {/* MATERIAL */}
                    <View style={[styles.responseContainer, { backgroundColor: theme.colors.card }]}>
                        <View style={{ alignItems: "flex-start", flexDirection: "column", width: "70%" }}>
                            <ThemedText style={[styles.titleText, { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 }]}>Material:</ThemedText>
                            <ThemedText style={[styles.answerText, { fontFamily: theme.fonts.regular, fontSize: theme.sizes.text }]}>{materialVal}</ThemedText>
                        </View>
                        <View style={{ flexGrow: 1, alignItems: "flex-end" }}>
                            <Ionicons name="create" size={20} color={theme.colors.text} />
                        </View>
                    </View>

                    {/* FIT */}
                    <View style={[styles.responseContainer, { backgroundColor: theme.colors.card }]}>
                        <View style={{ alignItems: "flex-start", flexDirection: "column", width: "70%" }}>
                            <ThemedText style={[styles.titleText, { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 }]}>Fit:</ThemedText>
                            <ThemedText style={[styles.answerText, { fontFamily: theme.fonts.regular, fontSize: theme.sizes.text }]}>{fitVal}</ThemedText>
                        </View>
                        <View style={{ flexGrow: 1, alignItems: "flex-end" }}>
                            <Ionicons name="create" size={20} color={theme.colors.text} />
                        </View>
                    </View>

                    {/* SEASON (Optional) */}
                    <View style={[styles.responseContainer, { backgroundColor: theme.colors.card, alignItems: seasonVal ? "stretch" : "center", justifyContent: seasonVal ? "flex-start" : "center" }]}>
                        <View style={{ alignItems: "flex-start", flexDirection: "column", width: "70%" }}>
                            {seasonVal ? (
                                <>
                                    <ThemedText style={[styles.titleText, { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 }]}>Season:</ThemedText>
                                    <ThemedText style={[styles.answerText, { fontFamily: theme.fonts.regular, fontSize: theme.sizes.text }]}>{seasonVal}</ThemedText>
                                </>
                            ) : (
                                <ThemedText style={{ fontSize: theme.sizes.h3, color: theme.colors.text, fontFamily: theme.fonts.regular }}>Season not specified</ThemedText>
                            )}
                        </View>
                        <View style={{ flexGrow: 1, alignItems: "flex-end" }}>
                            <Ionicons name="create" size={20} color={theme.colors.text} />
                        </View>
                    </View>

                    {/* LENGTH (Optional) */}
                    <View style={[styles.responseContainer, { backgroundColor: theme.colors.card, alignItems: lengthVal ? "stretch" : "center", justifyContent: lengthVal ? "flex-start" : "center" }]}>
                        <View style={{ alignItems: "flex-start", flexDirection: "column", width: "70%" }}>
                            {lengthVal ? (
                                <>
                                    <ThemedText style={[styles.titleText, { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 }]}>Length:</ThemedText>
                                    <ThemedText style={[styles.answerText, { fontFamily: theme.fonts.regular, fontSize: theme.sizes.text }]}>{lengthVal}</ThemedText>
                                </>
                            ) : (
                                <ThemedText style={{ fontSize: theme.sizes.h3, color: theme.colors.text, fontFamily: theme.fonts.regular }}>Length not specified</ThemedText>
                            )}
                        </View>
                        <View style={{ flexGrow: 1, alignItems: "flex-end" }}>
                            <Ionicons name="create" size={20} color={theme.colors.text} />
                        </View>
                    </View>

                    {/* BULK (Optional) */}
                    <View style={[styles.responseContainer, { backgroundColor: theme.colors.card, alignItems: bulkVal ? "stretch" : "center", justifyContent: bulkVal ? "flex-start" : "center" }]}>
                        <View style={{ alignItems: "flex-start", flexDirection: "column", width: "70%" }}>
                            {bulkVal ? (
                                <>
                                    <ThemedText style={[styles.titleText, { fontFamily: theme.fonts.bold, fontSize: theme.sizes.h3 }]}>Bulk:</ThemedText>
                                    <ThemedText style={[styles.answerText, { fontFamily: theme.fonts.regular, fontSize: theme.sizes.text }]}>{bulkVal}</ThemedText>
                                </>
                            ) : (
                                <ThemedText style={{ fontSize: theme.sizes.h3, color: theme.colors.text, fontFamily: theme.fonts.regular }}>Bulk not specified</ThemedText>
                            )}
                        </View>
                        <View style={{ flexGrow: 1, alignItems: "flex-end" }}>
                            <Ionicons name="create" size={20} color={theme.colors.text} />
                        </View>
                    </View>

                </ScrollView>
            </View>
        </>
    );
}

const styles = {
    container: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 100, width: "100%", height: "100%", paddingHorizontal: 30, alignItems: "stretch", paddingVertical: 20 },
    chevronView: { justifyContent: "flex-start", paddingBottom: 20, width: "100%" },

    // NEW STYLE: Matches the image placeholder from closet.jsx / itemProperty.jsx
    imagePlaceholder: {
        height: 250,
        width: "100%",
        borderRadius: 14,
        backgroundColor: "#d6c6b8",
        marginBottom: 10
    },

    responseContainer: { width: "100%", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, flexDirection: "row", marginTop: 20 },
    titleText: {},
    answerText: { alignSelf: "flex-start" },
};