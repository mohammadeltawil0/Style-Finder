import React, { useState, useEffect } from 'react';
// IMPORT SWITCH
import { Platform, KeyboardAvoidingView, View, Text, Alert, StyleSheet, FlatList, TouchableOpacity,
  Modal, ActivityIndicator, ScrollView, Pressable, Switch, Image } from 'react-native';
import { apiClient } from "../../scripts/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import { ThemedText } from "../../components";
import * as Location from 'expo-location';
import { OutfitToggle } from "../../components/outfit-toggle";
import RegularOutfit from "../screens/GenerateOutfits/RegularOutfit";
import TripOutfit from "../screens/GenerateOutfits/TripOutfit";


const formatEnum = (str) => {
  if (!str) return "";
  let cleanStr = str.replace(/_OR_/g, " / ").replace(/_/g, " ");
  return cleanStr.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

const FORMALITY_OPTIONS = ["CASUAL", "FORMAL", "WORK_OR_SMART", "PARTY_OR_NIGHT_OUT", "VERSATILE"];

// --- OUTFIT DETAILS MODAL ---
const OutfitDetailsModal = ({ visible, outfit, onClose, onAction, theme }) => {
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
        console.error("Failed to load items:", error);
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
              <ActivityIndicator size="large" color={theme.colors.text} />
          ) : (
              <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                <ThemedText style={styles.modalTitle}>Outfit Details</ThemedText>
                {items.map((item, index) => (
                    <View key={index} style={[styles.responseContainer, { backgroundColor: theme.colors.card }]}>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>{formatEnum(item.type)}</ThemedText>
                        <ThemedText style={{ fontSize: 14, marginBottom: 10 }}>
                          A {item.color?.toLowerCase()} {formatEnum(item.fit)} fit {formatEnum(item.type).toLowerCase()}.
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
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#b49480' }]} onPress={() => onAction('SAVE')}>
                    <Text style={styles.actionBtnText}>Save Outfit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e2d7cd' }]} onPress={() => onAction('EDIT_SAVE')}>
                    <Text style={[styles.actionBtnText, { color: '#000' }]}>Edit & Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ff4444' }]} onPress={() => onAction('REJECT')}>
                    <Text style={styles.actionBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
          )}
        </View>
      </Modal>
  );
};

// --- MAIN SCREEN ---
export default function SuggestionHub() {
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState([]);
  const [eventStr, setEventStr] = useState('CASUAL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useMemory, setUseMemory] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const getUserId = async () => {
    try {
      const storedIdString = await AsyncStorage.getItem('userId');
      if (storedIdString !== null) return parseInt(storedIdString, 10);
    } catch (error) {
      console.error("Storage error", error);
    }
    return null;
  };

  const fetchSuggestions = async () => {
    try {
      setIsGenerating(true);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location is required for weather-based outfits.');
        setIsGenerating(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      const locationCoords = `${location.coords.latitude},${location.coords.longitude}`;

      const userId = await getUserId();
      const res = await apiClient.post(`/api/v1/suggestions/hub/${userId}`, {
        location: locationCoords,
        event: eventStr,
        useMemory: useMemory
      });

      setSuggestions(res.data?.slice(0, 10) || []);
    } catch (error) {
      Alert.alert("Error", "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAction = async (actionType, editedItemIds = null) => {
    if (!selectedOutfit) return;

    try {
      await apiClient.post(`/api/v1/suggestions/feedback`, {
        userId: await getUserId(),
        suggestionId: selectedOutfit.suggestionId,
        originalItemIds: selectedOutfit.itemIds,
        finalItemIds: editedItemIds || selectedOutfit.itemIds,
        action: actionType,
        contextTemp: 72,
        contextOccasion: eventStr || "Casual"
      });

      // Remove the acted-upon outfit from the grid
      setSuggestions(prev =>
          prev.filter(outfit => outfit.suggestionId !== selectedOutfit.suggestionId));
      setIsModalVisible(false);
      setSelectedOutfit(null);

    } catch (error) {
      console.error("Error processing feedback:", error);
      Alert.alert("Error", "Failed to process your choice.");
    }
  };

  // Calculate dynamic button text
  const buttonText = isGenerating
      ? "Processing..."
      : (useMemory ? "Recall Outfits" : "Generate 10 New Outfits");

  return (
      <View style={styles.container}>
        <View style={styles.controlsContainer}>
          <ThemedText style={{ marginBottom: 10, fontWeight: 'bold' }}>Select Occasion:</ThemedText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
            {FORMALITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                    key={opt}
                    onPress={() => setEventStr(opt)}
                    style={[styles.chip, { backgroundColor: eventStr === opt ? theme.colors.tabIconSelected : theme.colors.card }]}
                >
                  <Text style={{ color: eventStr === opt ? '#fff' : theme.colors.text }}>{formatEnum(opt)}</Text>
                </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.toggleRow}>
            <ThemedText style={{ fontWeight: '500' }}>Recall past outfits?</ThemedText>
            <Switch
                trackColor={{ false: "#767577", true: theme.colors.tabIconSelected }}
                thumbColor={"#f4f3f4"}
                onValueChange={setUseMemory}
                value={useMemory}
            />
          </View>
          <TouchableOpacity
              style={[styles.generateBtn, { backgroundColor: theme.colors.tabIconSelected }]}
              onPress={fetchSuggestions}
              disabled={isGenerating}
          >
            {isGenerating ? <ActivityIndicator color="#fff" /> : <Text style={styles.generateBtnText}>{buttonText}</Text>}
          </TouchableOpacity>
        </View>
        <FlatList
            data={suggestions}
            keyExtractor={(item) => item.suggestionId}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={({ item, index }) => (
                <TouchableOpacity
                    style={[styles.outfitCard, { backgroundColor: theme.colors.lightBrown }]}
                    onPress={() => { setSelectedOutfit(item); setIsModalVisible(true); }}
                >
                  {item.coverImageUrl ? (
                      <Image
                          source={{ uri: item.coverImageUrl }}
                          style={{ height: 120, width: "100%", borderTopLeftRadius: 10, borderTopRightRadius: 10}}
                          resizeMode="cover"
                      />
                  ) : (
                      <View style={styles.cardImagePlaceholder}>
                        <ThemedText>Outfit {index + 1}</ThemedText>
                      </View>
                  )}
                  <View style={[styles.cardFooter, { backgroundColor: theme.colors.card }]}>
                    <ThemedText>Score: {item.score?.toFixed(1)}</ThemedText>
                  </View>
                </TouchableOpacity>
            )}
        />

        <OutfitDetailsModal
            visible={isModalVisible}
            outfit={selectedOutfit}
            onClose={() => setIsModalVisible(false)}
            onAction={handleAction}
            theme={theme}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  controlsContainer: { marginBottom: 20, padding: 15, backgroundColor: '#f5f5f5', borderRadius: 10 },
  generateBtn: { padding: 15, borderRadius: 10, alignItems: 'center' },
  generateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
  outfitCard: { flex: 1, borderRadius: 10, marginBottom: 20, maxWidth: '48%', overflow: 'hidden' },
  cardImagePlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center' },
  cardFooter: { padding: 10 },
  modalContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  chevronView: { alignItems: "flex-end", marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  responseContainer: { padding: 15, borderRadius: 10, marginBottom: 15 },
  itemImagePlaceholder: { height: 180, borderRadius: 10, marginTop: 5 },
  modalActions: { marginTop: 20, gap: 10 },
  actionBtn: { padding: 15, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: 'bold' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
});