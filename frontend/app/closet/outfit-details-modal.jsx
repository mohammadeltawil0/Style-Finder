import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal,
    ActivityIndicator, ScrollView, Pressable, StyleSheet, Image } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { ThemedText } from "../../components";
import { apiClient } from "../../scripts/apiClient";

// --- FORMATTING HELPER ---
const formatEnum = (str) => {
    if (!str) return "";
    let cleanStr = str.replace(/_OR_/g, " / ").replace(/_/g, " ");
    return cleanStr.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export default function OutfitDetailsModal({ visible, outfit, onClose, onDelete, theme }) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOutfitItems = async () => {
            if (!outfit || !outfit.itemIds) return;
            try {
                setIsLoading(true);
                const itemPromises = outfit.itemIds.map(id => apiClient.get(`/api/items/${id}`));
                const responses = await Promise.all(itemPromises);
                let fetchedItems = responses.map(res => res.data);
                const typeOrder = { "OVER": 1, "OUTERWEAR": 1, "TOP": 2, "FULL_BODY": 3, "BOTTOM": 4 };
                fetchedItems.sort((a, b) => (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99));
                setItems(fetchedItems);
            } catch (error) {
                console.error("Failed to load outfit items:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (visible) fetchOutfitItems();
    }, [visible, outfit]);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                <View style={styles.chevronView}>
                    <Pressable onPress={onClose}><Entypo name="chevron-down" size={30} color={theme.colors.text} /></Pressable>
                </View>

                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.text} />
                        <ThemedText style={{ marginTop: 10 }}>Loading outfit details...</ThemedText>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ paddingBottom: 40, width: "100%" }}>
                        <ThemedText style={styles.modalTitle}>Outfit Details</ThemedText>

                        {items.map((item, index) => (
                            <View key={index} style={[styles.responseContainer, { backgroundColor: theme.colors.card }]}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>
                                        {formatEnum(item.type)}
                                    </ThemedText>
                                    <ThemedText style={{ fontSize: 14 }}>
                                        A {item.color ? item.color.toLowerCase() : ""} {formatEnum(item.fit)} fit {formatEnum(item.type).toLowerCase()} with a {formatEnum(item.pattern)} pattern.
                                    </ThemedText>
                                    {item.imageUrl ? (
                                        <Image
                                            source={{ uri: item.imageUrl }}
                                            style={styles.itemImagePlaceholder}
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[styles.itemImagePlaceholder, { backgroundColor: theme.colors.lightBrown, justifyContent: 'center', alignItems: 'center' }]}>
                                            <ThemedText style={{ color: '#666' }}>No Image</ThemedText>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ff4444' }]} onPress={() => onDelete(outfit.outfitId || outfit.id)}>
                                <Text style={styles.actionBtnText}>Delete Outfit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.colors.lightBrown }]} onPress={onClose}>
                                <Text style={[styles.actionBtnText, { color: theme.colors.text }]}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
    chevronView: { alignItems: "flex-end", marginBottom: 10 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    responseContainer: { padding: 15, borderRadius: 10, marginBottom: 15 },
    itemImagePlaceholder: { height: 180, borderRadius: 10, marginTop: 5 },
    modalActions: { marginTop: 20, gap: 10 },
    actionBtn: { padding: 15, borderRadius: 10, alignItems: 'center' },
    actionBtnText: { fontWeight: 'bold', color: '#fff' }
});