import { ActivityIndicator, Image, Modal, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "../../components";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "../../scripts/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// TO DO: edit item logic
export default function EditItemsModal({ item, setModalVisible }) {
    const [uri, setUri] = useState(null);
    const [category, setCategory] = useState("Top");
    const [pattern, setPattern] = useState("solid-unicolor");
    const [color, setColor] = useState("red");
    const [material, setMaterial] = useState("cotton");
    const [event, setEvent] = useState("casual");
    const [fit, setFit] = useState("regular");
    const [season, setSeason] = useState(null);
    const [length, setLength] = useState(null);
    const [bulk, setBulk] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const theme = useTheme();
    const queryClient = useQueryClient();

    console.log("Editing item:", item);
    const hasImageUrl = typeof uri === "string" && uri.trim().length > 0;
    console.log("Image URL check - uri:", uri, "hasImageUrl:", hasImageUrl);

    const fitToSliderValue = (value) => {
        if (typeof value === "number") return value;
        if (value === "SLIM") return 0;
        if (value === "REGULAR") return 1;
        if (value === "LOOSE") return 2;
        return 1;
    };

    useEffect(() => {
        if (!item) return;

        setUri(item.imageUrl || item.uri || null);
        setCategory(item.type || item.category || "Top");
        setPattern(item.pattern || "solid-unicolor");
        setColor(item.color || null);
        setMaterial(item.material ?? "cotton");
        setEvent(item.formality || item.event || "casual");
        setFit(fitToSliderValue(item.fit));
        setSeason(item.seasonWear || item.season || null);
        setLength(item.length || null);
        setBulk(typeof item.bulk === "number" ? item.bulk : null);
    }, [item]);

    let convertedFit = 0;
    let convertedBulk = 0;

    fit >= 0 && fit < 0.5
        ? (convertedFit = 0)
        : fit >= 0.5 && fit < 1.5
            ? (convertedFit = 1)
            : (convertedFit = 2);

    bulk >= 0 && bulk <= 0.5
        ? (convertedBulk = 0)
        : bulk >= 0.51 && bulk < 1.49
            ? (convertedBulk = 1)
            : (convertedBulk = 2);

    const deleteItemMutation = useMutation({
        mutationFn: async (itemId) => {
            await apiClient.delete(`/api/items/${itemId}`);
        },
        onSuccess: async () => {
            // Keep query keys aligned with ClosetScreen useQuery(['items', userId]).
            await queryClient.invalidateQueries({ queryKey: ["items"] });
            setIsDeleteModalVisible(false);
            setModalVisible(false);
        },
        onError: (error) => {
            console.error("Failed to delete item:", error);
        },
    });

    const handleDeleteItem = () => {
        const resolvedItemId = item?.itemId ?? item?.id;
        if (!resolvedItemId || deleteItemMutation.isPending) {
            console.error("Delete blocked: missing item id", item);
            return;
        }

        console.log("Deleting item id:", resolvedItemId);
        deleteItemMutation.mutate(resolvedItemId);
    };

    return (
        <>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.background,
                    },
                ]}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: "stretch",
                        width: "100%",
                    }}
                >
                    <View className="chevronView" style={styles.chevronView}>
                        <Pressable
                            onPress={() => setModalVisible(false)}
                            style={{ width: 30, height: 30 }}
                        >
                            <Entypo name="chevron-left" size={30} color="black" />
                        </Pressable>
                    </View>
                    {!hasImageUrl ? (
                        <View
                            className="imageContainer"
                            style={[
                                styles.imageContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderRadius: 10,
                                    padding: 20,
                                    alignItems: "center",
                                    justifyContent: "center",
                                },
                            ]}
                        >
                            <ThemedText style={{ textAlign: "center" }}>
                                No image found for this item.
                            </ThemedText>
                        </View>
                    ) : (
                        <View
                            className="imageContainer"
                            style={[
                                styles.imageContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderRadius: 10,
                                    overflow: "hidden",
                                },
                            ]}
                        >
                            <Image
                                source={{ uri }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="cover"
                            />
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.deleteBtn, { backgroundColor: theme.colors.tabIconSelected }]}
                        onPress={() => setIsDeleteModalVisible(true)}
                    >
                        <ThemedText style={{ color: theme.colors.text, fontFamily: theme.fonts.bold }}>
                            Delete Item
                        </ThemedText>
                    </TouchableOpacity>
                    <View
                        style={[
                            styles.responseContainer,
                            {
                                backgroundColor: theme.colors.card,
                            },
                        ]}
                    >
                        <View
                            className="response"
                            style={{
                                alignItems: "flex-start",
                                flexDirection: "column",
                            }}
                        >
                            <ThemedText
                                style={[
                                    styles.titleText,
                                    {
                                        fontFamily: theme.fonts.bold,
                                        fontSize: theme.sizes.h3,
                                    },
                                ]}
                            >
                                Category:
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.answerText,
                                    {
                                        fontFamily: theme.fonts.regular,
                                        fontSize: theme.sizes.text,
                                    },
                                ]}
                            >
                                {category}
                            </ThemedText>
                        </View>
                        <View
                            className="editContainer"
                            style={{
                                flexGrow: 1,
                                alignItems: "flex-end",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons
                                name="create"
                                size={20}
                                color={theme.colors.text}
                            />
                        </View>
                    </View>
                    <View
                        style={[
                            styles.responseContainer,
                            {
                                backgroundColor: theme.colors.card,
                            },
                        ]}
                    >
                        <View
                            className="response"
                            style={{
                                alignItems: "flex-start",
                                flexDirection: "column",
                                width: "70%",
                            }}
                        >
                            <ThemedText
                                style={[
                                    styles.titleText,
                                    {
                                        fontFamily: theme.fonts.bold,
                                        fontSize: theme.sizes.h3,
                                    },
                                ]}
                            >
                                Pattern:
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.answerText,
                                    {
                                        fontFamily: theme.fonts.regular,
                                        fontSize: theme.sizes.text,
                                    },
                                ]}
                            >
                                {pattern}
                            </ThemedText>
                        </View>
                        {!color && (
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end" }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </View>
                        )}
                    </View>
                    {color && (
                        <View
                            style={[
                                styles.responseContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                },
                            ]}
                        >
                            <View
                                className="response"
                                style={{
                                    alignItems: "flex-start",
                                    flexDirection: "column",
                                    width: "70%",
                                }}
                            >
                                <ThemedText
                                    style={[
                                        styles.titleText,
                                        {
                                            fontFamily: theme.fonts.bold,
                                            fontSize: theme.sizes.h3,
                                        },
                                    ]}
                                >
                                    Color:
                                </ThemedText>
                                <View
                                    className="colorContainer"
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 10,
                                    }}
                                >
                                    <View
                                        className="colorPreview"
                                        style={{
                                            backgroundColor: color,
                                            width: 30,
                                            height: 30,
                                            borderRadius: 25,
                                            padding: 0,
                                        }}
                                    ></View>
                                    <ThemedText
                                        style={{
                                            fontFamily: theme.fonts.regular,
                                            fontSize: theme.sizes.text,
                                            margin: 0,
                                        }}
                                    >
                                        {color}
                                    </ThemedText>
                                </View>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end" }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </View>
                        </View>
                    )}
                    <View
                        style={[
                            styles.responseContainer,
                            {
                                backgroundColor: theme.colors.card,
                            },
                        ]}
                    >
                        <View
                            className="response"
                            style={{
                                alignItems: "flex-start",
                                flexDirection: "column",
                                width: "70%",
                            }}
                        >
                            <ThemedText
                                style={[
                                    styles.titleText,
                                    {
                                        fontFamily: theme.fonts.bold,
                                        fontSize: theme.sizes.h3,
                                    },
                                ]}
                            >
                                Event:
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.answerText,
                                    {
                                        fontFamily: theme.fonts.regular,
                                        fontSize: theme.sizes.text,
                                    },
                                ]}
                            >
                                {event}
                            </ThemedText>
                        </View>
                        <View
                            className="editContainer"
                            style={{ flexGrow: 1, alignItems: "flex-end" }}
                        >
                            <Ionicons
                                name="create"
                                size={20}
                                color={theme.colors.text}
                            />
                        </View>
                    </View>
                    <View
                        style={[
                            styles.responseContainer,
                            {
                                backgroundColor: theme.colors.card,
                            },
                        ]}
                    >
                        <View
                            className="response"
                            style={{
                                alignItems: "flex-start",
                                flexDirection: "column",
                                width: "70%",
                            }}
                        >
                            <ThemedText
                                style={[
                                    styles.titleText,
                                    {
                                        fontFamily: theme.fonts.bold,
                                        fontSize: theme.sizes.h3,
                                    },
                                ]}
                            >
                                Material:
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.answerText,
                                    {
                                        fontFamily: theme.fonts.regular,
                                        fontSize: theme.sizes.text,
                                    },
                                ]}
                            >
                                {material}
                            </ThemedText>
                        </View>
                        <View
                            className="editContainer"
                            style={{ flexGrow: 1, alignItems: "flex-end" }}
                        >
                            <Ionicons
                                name="create"
                                size={20}
                                color={theme.colors.text}
                            />
                        </View>
                    </View>
                    <View
                        style={[
                            styles.responseContainer,
                            {
                                backgroundColor: theme.colors.card,
                            },
                        ]}
                    >
                        <View
                            className="response"
                            style={{
                                alignItems: "flex-start",
                                flexDirection: "column",
                                width: "70%",
                            }}
                        >
                            <ThemedText
                                style={[
                                    styles.titleText,
                                    {
                                        fontFamily: theme.fonts.bold,
                                        fontSize: theme.sizes.h3,
                                    },
                                ]}
                            >
                                Fit:
                            </ThemedText>
                            <ThemedText
                                style={[
                                    styles.answerText,
                                    {
                                        fontFamily: theme.fonts.regular,
                                        fontSize: theme.sizes.text,
                                    },
                                ]}
                            >
                                {convertedFit}
                            </ThemedText>
                        </View>
                        <View
                            className="editContainer"
                            style={{ flexGrow: 1, alignItems: "flex-end" }}
                        >
                            <Ionicons
                                name="create"
                                size={20}
                                color={theme.colors.text}
                            />
                        </View>
                    </View>
                    {/* OPTIONAL PARAMETERS */}
                    {season ? (
                        <View
                            style={[
                                styles.responseContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                },
                            ]}
                        >
                            <View
                                className="response"
                                style={{
                                    alignItems: "flex-start",
                                    flexDirection: "column",
                                    width: "70%",
                                }}
                            >
                                <ThemedText
                                    style={[
                                        styles.titleText,
                                        {
                                            fontFamily: theme.fonts.bold,
                                            fontSize: theme.sizes.h3,
                                        },
                                    ]}
                                >
                                    Season:
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.answerText,
                                        {
                                            fontFamily: theme.fonts.regular,
                                            fontSize: theme.sizes.text,
                                        },
                                    ]}
                                >
                                    {season}
                                </ThemedText>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end" }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </View>
                        </View>
                    ) : (
                        <View
                            style={[
                                styles.responseContainer,
                                {
                                    alignItems: "center",
                                    backgroundColor: theme.colors.card,
                                    justifyContent: "center",
                                },
                            ]}
                        >
                            <View
                                className="response"
                                style={{
                                    alignItems: "flex-start",
                                    flexDirection: "column",
                                    width: "70%",
                                }}
                            >
                                <ThemedText
                                    style={{
                                        fontSize: theme.sizes.h3,
                                        color: theme.colors.text,
                                        fontFamily: theme.fonts.regular,
                                    }}
                                >
                                    Season not specified
                                </ThemedText>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end" }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </View>
                        </View>
                    )}
                    {length ? (
                        <View
                            style={[
                                styles.responseContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                },
                            ]}
                        >
                            <View
                                className="response"
                                style={{
                                    alignItems: "flex-start",
                                    flexDirection: "column",
                                    width: "70%",
                                }}
                            >
                                <ThemedText
                                    style={[
                                        styles.titleText,
                                        {
                                            fontFamily: theme.fonts.bold,
                                            fontSize: theme.sizes.h3,
                                        },
                                    ]}
                                >
                                    Length:
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.answerText,
                                        {
                                            fontFamily: theme.fonts.regular,
                                            fontSize: theme.sizes.text,
                                        },
                                    ]}
                                >
                                    {length}
                                </ThemedText>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end" }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </View>
                        </View>
                    ) : (
                        <View
                            style={[
                                styles.responseContainer,
                                {
                                    alignItems: "center",
                                    backgroundColor: theme.colors.card,
                                    justifyContent: "center",
                                },
                            ]}
                        >
                            <View
                                className="response"
                                style={{
                                    alignItems: "flex-start",
                                    flexDirection: "column",
                                    width: "70%",
                                }}
                            >
                                <ThemedText
                                    style={{
                                        fontSize: theme.sizes.h3,
                                        color: theme.colors.text,
                                        fontFamily: theme.fonts.regular,
                                    }}
                                >
                                    Length not specified
                                </ThemedText>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end" }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </View>
                        </View>
                    )}
                    {bulk ? (
                        <View
                            style={[
                                styles.responseContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                },
                            ]}
                        >
                            <View
                                className="response"
                                style={{
                                    alignItems: "flex-start",
                                    flexDirection: "column",
                                    width: "70%",
                                }}
                            >
                                <ThemedText
                                    style={[
                                        styles.titleText,
                                        {
                                            fontFamily: theme.fonts.bold,
                                            fontSize: theme.sizes.h3,
                                        },
                                    ]}
                                >
                                    Bulk:
                                </ThemedText>
                                <ThemedText
                                    style={[
                                        styles.answerText,
                                        {
                                            fontFamily: theme.fonts.regular,
                                            fontSize: theme.sizes.text,
                                        },
                                    ]}
                                >
                                    {convertedBulk}
                                </ThemedText>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end" }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </View>
                        </View>
                    ) : (
                        <View
                            style={[
                                styles.responseContainer,
                                {
                                    alignItems: "center",
                                    backgroundColor: theme.colors.card,
                                    justifyContent: "center",
                                },
                            ]}
                        >
                            <View
                                className="response"
                                style={{
                                    alignItems: "flex-start",
                                    flexDirection: "column",
                                    width: "70%",
                                }}
                            >
                                <ThemedText
                                    style={{
                                        fontSize: theme.sizes.h3,
                                        color: theme.colors.text,
                                        fontFamily: theme.fonts.regular,
                                    }}
                                >
                                    Bulk not specified
                                </ThemedText>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end" }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

            <Modal
                visible={isDeleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDeleteModalVisible(false)}
            >
                <View style={styles.confirmOverlay}>
                    <View style={[styles.confirmCard, { backgroundColor: theme.colors.card }]}>
                        <ThemedText style={{
                            fontSize: theme.sizes.h2,
                            fontWeight: "700",
                            marginBottom: 8,
                        }}>Delete this item?</ThemedText>
                        <ThemedText style={styles.confirmText}>
                            This action cannot be undone. This will also remove this item from any outfits it's included in, and will thus, remove the outfit as well.
                        </ThemedText>

                        <View style={styles.confirmActions}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: theme.colors.lightBrown }]}
                                onPress={() => setIsDeleteModalVisible(false)}
                                disabled={deleteItemMutation.isPending}
                            >
                                <ThemedText>Cancel</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: theme.colors.tabIconSelected, opacity: deleteItemMutation.isPending ? 0.7 : 1 }]}
                                onPress={handleDeleteItem}
                                disabled={deleteItemMutation.isPending}
                            >
                                {deleteItemMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <ThemedText style={{ color: theme.colors.text }}>Delete</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = {
    container: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        width: "100%",
        height: "100%",
        paddingHorizontal: 30,
        alignItems: "stretch",
        paddingVertical: 20
    },
    chevronView: {
        justifyContent: "flex-start",
        paddingVertical: 20,
        width: "100%",
    },
    imageContainer: {
        height: 200,
        width: 200,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    responseContainer: {
        width: "100%",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        flexDirection: "row",
        marginTop: 20,
    },
    deleteBtn: {
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    confirmCard: {
        width: "100%",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
    },
    logoWrap: {
        marginBottom: 10,
        transform: [{ scale: 2 }],
    },
    confirmText: {
        textAlign: "center",
        marginBottom: 16,
    },
    confirmActions: {
        width: "100%",
        flexDirection: "row",
        gap: 10,
    },
    confirmBtn: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    }
};
