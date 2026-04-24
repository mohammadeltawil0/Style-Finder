import { useState, useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { apiClient } from "../../scripts/apiClient";
import placeholderImg from "../../assets/images/placeholder.png";

// Page Imports
import CameraPage from "./camera-page.jsx";
import CategoryPage from "./category-page.jsx";
import ColorPage from "./color-page.jsx";
import EventPage from "./event-page.jsx";
import ReviewPage from "./review-page.jsx";
import SeasonPage from "./season-page.jsx";
import MaterialPage from "./material-page.jsx";
import FitPage from "./fit-page.jsx";
import LengthPage from "./length-page.jsx";
import BulkPage from "./bulk-page.jsx";

const PREVIEW_MODE_STORAGE_KEY = "addItemPreviewMode";

export default function AddItemScreen() {
  const [navigation, setNavigation] = useState({
    currentPage: 1,
    nextPage: 2,
    previousPage: null,
  });
  const [uri, setUri] = useState(null);

  // Core Item States
  const [itemType, setItemType] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [formality, setFormality] = useState("");
  const [isSolid, setIsSolid] = useState(false);
  const [material, setMaterial] = useState("");
  const [fit, setFit] = useState("");
  const [season, setSeason] = useState("");
  const [length, setLength] = useState("");
  const [bulk, setBulk] = useState("");

  // UI & Editing States
  const [editing, setEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isPreviewModeHydrated, setIsPreviewModeHydrated] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  // Load Preview Mode State
  useEffect(() => {
    const loadPreviewMode = async () => {
      try {
        const storedPreviewMode = await AsyncStorage.getItem(PREVIEW_MODE_STORAGE_KEY);
        if (storedPreviewMode === "true" || storedPreviewMode === "false") {
          setPreviewMode(storedPreviewMode === "true");
        }
      } catch (error) {
        console.error("Failed to load preview mode:", error);
      } finally {
        setIsPreviewModeHydrated(true);
      }
    };
    loadPreviewMode();
  }, []);

  // Format Enum Helpers
  const convertPattern = (p) => p === "Plaid/Flannel" ? "PLAID_OR_FLANNEL" : p?.toUpperCase();
  const convertItemType = (t) => t?.replace(/ /g, "_").toUpperCase();

  const convertFit = (f) => {
    if (f === null || f === undefined) return null;
    if (typeof f === "string") return f; // Fallback if already converted
    if (f < 0.5) return "SLIM";
    if (f < 1.5) return "REGULAR";
    if (f <= 2.5) return "LOOSE";
    return "OVERSIZED";
  };

  const buildItemPayload = (userId) => ({
    userId: userId,
    type: itemType ? convertItemType(itemType) : null,
    color: color || null,
    pattern: isSolid ? "SOLID" : convertPattern(pattern),
    length: length || null,
    material: material || null,  // material-page already sends "COTTON", "LINEN", etc.
    bulk: bulk !== null ? bulk : null,
    seasonWear: season || null,
    formality: formality || null,
    fit: convertFit(fit)
  });

  // Navigation Helpers
  const goNext = (targetPage = null) => {
    setNavigation(prev => ({
      previousPage: prev.currentPage,
      currentPage: targetPage !== null ? targetPage : prev.nextPage,
      nextPage: targetPage !== null ? targetPage + 1 : prev.nextPage + 1,
    }));
  };

  const goBack = () => {
    if (previewMode && navigation.currentPage !== 10) {
      setNavigation(prev => ({ previousPage: null, currentPage: 10, nextPage: 11 }));
      return;
    }
    setNavigation(prev => ({
      nextPage: prev.currentPage,
      currentPage: prev.previousPage || Math.max(1, prev.currentPage - 1),
      previousPage: prev.previousPage > 1 ? prev.previousPage - 1 : null,
    }));
  };

  // --- INTEGRATED NETWORK LOGIC ---
  const submitItem = async (payload) => {
    let finalImageUrl = payload.rawUri;

    // 1. Direct-to-CDN Upload (From Version B)
    if (typeof finalImageUrl === 'string' && finalImageUrl && !finalImageUrl.startsWith('http')) {

      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      console.log("Requesting Pre-signed URL...");
      const urlResponse =
          await apiClient.get(`/api/upload/presigned-url?filename=${filename}&contentType=${type}`);
      const { uploadUrl, publicUrl } = urlResponse.data;

      const response = await fetch(finalImageUrl);
      const blob = await response.blob();

      console.log("Uploading directly to Backblaze...");
      const backblazeResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': type },
      });

      if (!backblazeResponse.ok) {
        throw new Error("CDN Upload Failed");
      }
      finalImageUrl = publicUrl;
    }

    // 2. Save Item to Database (From Version A & B)
    const itemData = {
      ...payload.itemData,
      imageUrl: finalImageUrl || placeholderImg,
    };

    console.log("Submitting payload:", itemData);
    const apiRoute = editing ? `/api/items/${payload.itemId}` : `/api/items/add`;
    const response = editing
        ? await apiClient.put(apiRoute, itemData)
        : await apiClient.post(apiRoute, itemData);

    return response.data;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: submitItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      Toast.show({ type: 'success', text1: 'Item saved successfully!' });
      router.replace({ pathname: "/(tabs)/closet", params: { tab: "items" } });
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      Toast.show({
        type: 'error',
        text1: 'Failed to add item',
        text2: 'Server error or invalid format. Please try again.',
      });
    },
  });

  const handleSubmit = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const userId = Number(storedUserId);

      if (!Number.isInteger(userId) || userId <= 0) {
        Toast.show({ type: 'error', text1: 'Please log in again.' });
        return;
      }

      // Pass the raw URI into the mutation to handle the CDN fetch process
      mutate({
        rawUri: uri,
        itemData: buildItemPayload(userId),
        editing: editing
      });
    } catch (error) {
      console.log("❌ handleSubmit crashed:", error);
      Toast.show({ type: 'error', text1: 'Failed to prepare item submission.' });
    }
  };

  if (!isPreviewModeHydrated) {
    return null; // Wait for AsyncStorage to load preview mode
  }

  return (
      <View style={{ flex: 1 }}>
        {/* 1: Camera */}
        {navigation.currentPage === 1 && (
            <CameraPage
                setUri={setUri}
                uri={uri}
                setPage={goNext}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
            />
        )}

        {/* 2: Category */}
        {navigation.currentPage === 2 && (
            <CategoryPage
                itemType={itemType}
                setItemType={setItemType}
                setPage={goNext}
                goBack={goBack}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                uri={uri}
            />
        )}

        {/* 3: Pattern */}
        {navigation.currentPage === 3 && (
            <ColorPage
                color={color}
                setColor={setColor}
                pattern={pattern}
                setPattern={setPattern}
                setPage={goNext}
                goBack={goBack}
                isSolid={isSolid}
                setIsSolid={setIsSolid}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                uri={uri}
            />
        )}

        {/* 4: Event */}
        {navigation.currentPage === 4 && (
            <EventPage
                formality={formality}
                setFormality={setFormality}
                setPage={goNext}
                goBack={goBack}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                uri={uri}
            />
        )}

        {/* 5: Material */}
        {navigation.currentPage === 5 && (
            <MaterialPage
                material={material}
                setMaterial={setMaterial}
                setPage={goNext}
                goBack={goBack}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                uri={uri}
            />
        )}

        {/* 6: Fit */}
        {navigation.currentPage === 6 && (
            <FitPage
                fit={fit}
                setFit={setFit}
                setPage={goNext}
                goBack={goBack}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                uri={uri}
            />
        )}

        {/* OPTIONAL PARAMETERS */}
        {/* 7: Season */}
        {navigation.currentPage === 7 && (
            <SeasonPage
                season={season}
                setSeason={setSeason}
                setPage={goNext}
                goBack={goBack}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                uri={uri}
            />
        )}

        {/* 8: Length */}
        {navigation.currentPage === 8 && (
            <LengthPage
                length={length}
                setLength={setLength}
                itemType={itemType}
                setPage={goNext}
                goBack={goBack}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                uri={uri}
            />
        )}

        {/* 9: Bulk */}
        {navigation.currentPage === 9 && (
            <BulkPage
                bulk={bulk}
                setBulk={setBulk}
                setPage={goNext}
                goBack={goBack}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
                uri={uri}
            />
        )}

        {/* 10: Review & Submit */}
        {navigation.currentPage === 10 && (
            <ReviewPage
                itemType={itemType}
                color={color}
                pattern={pattern}
                formality={formality}
                material={material}
                fit={fit}
                season={season}
                length={length}
                bulk={bulk}
                goBack={goBack}
                setItemType={setItemType}
                setPattern={setPattern}
                setColor={setColor}
                setFormality={setFormality}
                setMaterial={setMaterial}
                setFit={setFit}
                setSeason={setSeason}
                setLength={setLength}
                setBulk={setBulk}
                handleSubmit={handleSubmit}
                uri={uri}
                isPending={isPending}
                setUri={setUri}
                setNavigation={setNavigation}
                setIsSolid={setIsSolid}
            />
        )}

        {isPending && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#b49480" />
              <Text style={styles.loadingText}>Uploading to Wardrobe...</Text>
            </View>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});