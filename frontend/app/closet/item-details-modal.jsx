import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Pressable, StyleSheet, Image } from "react-native";
import { ThemedText } from "../../components";
import { apiClient } from "../../scripts/apiClient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import EditItemsModal from "../closet/edit-items-modal";

// --- FORMATTING HELPER ---
const formatTagEnum = (str) => {
    if (!str) return "";
    let cleanStr = str.replace(/_OR_/g, " / ").replace(/_/g, " ");
    return cleanStr.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const formatDescriptionEnum = (str) => {
    if (!str) return "";
    let cleanStr = str.replace(/_OR_/g, " / ").replace(/_/g, " ");
    return cleanStr.toLowerCase();
};

export default function ItemDetailsModal() {
    const router = useRouter();
    const theme = useTheme();
    const { itemId } = useLocalSearchParams();
    const queryClient = useQueryClient();

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [editItemsModalVisible, setEditItemsModalVisible] = useState(false);
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    // refreshes data
    useEffect(() => {
        if (!editItemsModalVisible) {
            queryClient.invalidateQueries({ queryKey: ["item", itemId] });
        }
    }, [editItemsModalVisible]);

    const deleteItemMutation = useMutation({
        mutationFn: async (itemId) => {
            await apiClient.delete(`/api/items/${itemId}`);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["items"] });
            Toast.show({
                type: "success",
                text1: "Item deleted",
                text2: "The item was removed successfully.",
            });
            setIsDeleteModalVisible(false);
            router.back();
        },
        onError: (error) => {
            if (error?.response?.status === 404) {
                Toast.show({
                    type: "success",
                    text1: "Item deleted",
                    text2: "The item was already removed.",
                });
                setIsDeleteModalVisible(false);
                router.back();
                return;
            }
            console.error("Failed to delete item:", error);
            Toast.show({
                type: "error",
                text1: "Delete failed",
                text2: "We could not delete this item. Please try again.",
            });
        },
    });

    const handleDeleteItem = () => {
        const resolvedItemId = item?.itemId ?? item?.id;
        console.log("Attempting to delete item with id:", resolvedItemId);
        if (!resolvedItemId || deleteItemMutation.isPending) {
            console.error("Delete blocked: missing item id", item);
            return;
        }

        deleteItemMutation.mutate(resolvedItemId);
    };

    const {
        data: item,
        isLoading,
    } = useQuery({
        queryKey: ["item", itemId],
        enabled: !!itemId,
        queryFn: async () => {
            const response = await apiClient.get(`/api/items/${itemId}`);
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={theme.colors.text} />
                <ThemedText style={{ marginTop: 10 }}>Loading Item Details...</ThemedText>
            </View>
        );
    }

    if (!item) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ThemedText>Item not found.</ThemedText>
                <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={() => router.back()}>
                    <ThemedText>Go Back</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    const isValidUri = item?.imageUrl && typeof item.imageUrl === 'string' && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('file') || item.imageUrl.startsWith('data:'));

    return (
        <ScrollView showsVerticalScrollIndicator={true}>
            {editItemsModalVisible ? (
                <EditItemsModal
                    item={item}
                    setModalVisible={setEditItemsModalVisible}
                />
            ) : (
                <View style={{ paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 20 }}>
                        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Feather name="arrow-left" size={30} color={theme.colors.text} />
                        </TouchableOpacity>
                        <View style={{ position: "absolute", top: 20, right: 30, zIndex: 10 }}>
                            <TouchableOpacity
                                onPress={() => setIsMenuVisible((prev) => !prev)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Feather name="more-horizontal" size={30} color={theme.colors.text} />
                            </TouchableOpacity>

                            {isMenuVisible && (
                                <>
                                    <Pressable
                                        style={StyleSheet.absoluteFillObject}
                                        onPress={() => setIsMenuVisible(false)}
                                    />
                                    <View style={[styles.dropdownMenu, { backgroundColor: theme.colors.card }]}>
                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setIsMenuVisible(false);
                                                setEditItemsModalVisible(true);
                                            }}
                                        >
                                            <Ionicons name="image-outline" size={18} color={theme.colors.text} style={styles.dropdownIcon} />
                                            <ThemedText style={styles.dropdownLabel}>Edit Item</ThemedText>
                                        </TouchableOpacity>

                                        <View style={[styles.dropdownDivider, { backgroundColor: theme.colors.border ?? "#e0d6cf" }]} />

                                        <TouchableOpacity
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setIsMenuVisible(false);
                                                setIsDeleteModalVisible(true);
                                            }}
                                        >
                                            <FontAwesome6 name="trash" size={16} color="#c0392b" style={styles.dropdownIcon} />
                                            <ThemedText style={[styles.dropdownLabel, { color: "#c0392b" }]}>Delete Item</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Remove redundant Modal for dropdown. The overlay Pressable inside the dropdown area is enough. */}

                    <View>
                        {isValidUri ? (
                            <Image
                                source={{ uri: item.imageUrl }}
                                style={styles.imagePlaceholder}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Feather name="image" size={60} color={theme.colors.text} />
                            </View>
                        )}
                    </View>
                    <View style={styles.info}>
                        <View style={{ flexDirection: "row" }}>
                            <ThemedText style={styles.title}>{formatTagEnum(item.type)}</ThemedText>
                        </View>

                        <ThemedText style={styles.label}>Description:</ThemedText>
                        <ThemedText style={{ marginTop: 4, flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
                            A{' '}
                            <View style={{ height: 20, width: 20, borderRadius: 10, backgroundColor: item.color ? item.color.toLowerCase() : "#ccc", marginHorizontal: 6, display: "inline-block" }} />
                            {' '} {formatDescriptionEnum(item.fit)} fit {formatDescriptionEnum(item.type).toLowerCase()} with a {formatDescriptionEnum(item.pattern)} pattern, perfect for {formatDescriptionEnum(item.formality).toLowerCase()} occasions.
                        </ThemedText>

                        <ThemedText style={styles.label}>Tags:</ThemedText>
                        <View style={styles.tags}>
                            {item.color && <View style={styles.tag}><ThemedText>{formatTagEnum(item.color)}</ThemedText></View>}
                            {item.pattern && <View style={styles.tag}><ThemedText>{formatTagEnum(item.pattern)}</ThemedText></View>}
                            {item.formality && <View style={styles.tag}><ThemedText>{formatTagEnum(item.formality)}</ThemedText></View>}
                            {item.seasonWear && <View style={styles.tag}><ThemedText>{formatTagEnum(item.seasonWear)}</ThemedText></View>}
                            {item.fit && <View style={styles.tag}><ThemedText>{formatTagEnum(item.fit)} Fit</ThemedText></View>}
                            {item.material && <View style={styles.tag}><ThemedText>{formatTagEnum(item.material)}</ThemedText></View>}
                            {item.length && <View style={styles.tag}><ThemedText>{formatTagEnum(item.length)}</ThemedText></View>}
                        </View>
                        <View style={{ flexDirection: "column", gap: 6, borderColor: theme.colors.tabIconSelected, borderWidth: 2, alignSelf: 'flex-start', padding: 12, borderRadius: 8, marginVertical: 20 }}>
                            <ThemedText style={[styles.label, { marginTop: 0 }]}>Times Worn: {item.timesWorn}</ThemedText>
                        </View>
                    </View>

                    {/* Delete confirmation modal */}
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
                                    fontFamily: theme.fonts.bold,
                                }}>Delete this item?</ThemedText>
                                <ThemedText style={styles.confirmText}>
                                    This action cannot be undone. This will remove this item from any outfits it's included in, and will remove outfit as well.
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
                </View>
            )}
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    imagePlaceholder: {
        height: 250,
        // width: "100%",
        margin: 20,
        borderRadius: 14,
        backgroundColor: "#d6c6b8",
        alignItems: "center",
        justifyContent: "center",
    },
    info: {
        paddingHorizontal: 20,
    },
    title: {
        fontWeight: "bold",
        fontSize: 22,
        marginBottom: 10,
        fontFamily: "bold",
    },
    label: {
        marginTop: 15,
        fontWeight: "bold",
        fontSize: 20,
        fontFamily: "bold",
    },
    tags: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 10,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#e2d7cd",
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
    },
    btn: {
        backgroundColor: "#e2d7cd",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        flex: 0.48,
    },
    fullWidthBtn: {
        flex: 1,
    },
    confirmText: {
        textAlign: "center",
    },
    confirmActions: {
        marginTop: "10%",
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
    // Dropdown menu styles
    dropdownMenu: {
        position: "absolute",
        top: 32,
        right: 0,
        borderRadius: 10,
        paddingVertical: 4,
        minWidth: 160,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 20,
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownIcon: {
        marginRight: 10,
        width: 20,
        textAlign: "center",
    },
    dropdownLabel: {
        fontSize: 15,
    },
    dropdownDivider: {
        height: 1,
        marginHorizontal: 12,
    },
});