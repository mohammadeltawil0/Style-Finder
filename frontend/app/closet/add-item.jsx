import { useState } from "react";
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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "../../scripts/apiClient";
import * as FileSystem from 'expo-file-system/legacy';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export default function AddItemScreen() {
  const [navigation, setNavigation] = useState({
    currentPage: 1,
    nextPage: 2,
    previousPage: null,
  });
  const [uri, setUri] = useState(null);
  const [itemType, setItemType] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [formality, setFormality] = useState("");
  const [isSolid, setIsSolid] = useState(false); // handle in root so global; true if pressed next after "solid" button
  const [material, setMaterial] = useState("");
  const [fit, setFit] = useState(1); // default to middle value of 1, range from 0-2 (0: skinny, 1: regular, 2: loose)
  const [season, setSeason] = useState("");
  const [length, setLength] = useState("");
  const [bulk, setBulk] = useState(1); // default to middle value of 1, range from 0-2 (0: thin, 1: medium, 2: thick)
  const [editing, setEditing] = useState(false); // track if user is editing an existing item or adding new

  const router = useRouter();
  const queryClient = useQueryClient();

  // Navigation helpers
  const goToPage = (pageNum, fromPage = null) => {
    setNavigation({
      currentPage: pageNum,
      nextPage: pageNum + 1,
      previousPage: fromPage !== null ? fromPage : navigation.currentPage,
    });
  };

  const goNext = () => {
    // If editing, go back to review and stop editing
    if (editing) {
      setNavigation({
        currentPage: 10,
        nextPage: 11,
        previousPage: 9,
      });
      setEditing(false);
      return;
    }

    setNavigation((prev) => ({
      currentPage: prev.nextPage,
      nextPage: prev.nextPage + 1,
      previousPage: prev.currentPage,
    }));
  };

  console.log("goNext navigation state:", navigation);

  const goBack = () => {
    setNavigation((prev) => ({
      currentPage: prev.previousPage,
      nextPage: prev.currentPage,
      previousPage: prev.previousPage > 1 ? prev.previousPage - 1 : null,
    }));
  };

  console.log("goBack navigation state:", navigation);
  // Helper to navigate to edit a specific field from review
  const editField = (fieldPageNum) => {
    setEditing(true); // Enable editing mode
    goToPage(fieldPageNum, 10); // 10 is review page, will come back here after edit
  };

  // Convert states to match backend
  //1. Convert fit
  let convertedBulk = 0;

  const convertFit = (fit) => {
    if (fit < 0.5) return "SLIM";
    if (fit < 1.5) return "REGULAR";
    return "LOOSE";
  };

  bulk >= 0 && bulk <= 0.50
    ? (convertedBulk = 0)
    : bulk >= 0.51 && bulk < 1.49
      ? (convertedBulk = 1)
      : (convertedBulk = 2);

  const convertPattern = (pattern) => {
    const map = {
      "Solid": "SOLID",
      "Striped": "STRIPED",
      "Plaid": "PLAID_OR_FLANNEL",
      "Floral": "FLORAL",
      "Graphic": "GRAPHIC",
      "Geometric": "GEOMETRIC_OR_ABSTRACT",
    };
    return map[pattern] || pattern;
  };

  const convertItemType = (itemType) => {
    const map = {
      "Top": "TOP",
      "Bottom": "BOTTOM",
      "Full Body": "FULL_BODY",
      "Outerwear": "OUTERWEAR",
    };
    return map[itemType] || itemType;
  }

  const convertFormality = (formality) => {
    const map = {
      "Versatile": "VERSATILE",
      "Casual": "CASUAL",
      "Work/Smart": "WORK_OR_SMART",
      "Party/Night Out": "PARTY_OR_NIGHT_OUT",
      "Formal": "FORMAL",
      "Active/Sport": "ACTIVE_OR_SPORT",
    };
    return map[formality] || formality;
  }

  const convertMaterial = (material) => {
    return material ? Number(material) : null; // Convert material to number or return null if not set
  };

  const normalizeEnum = (value) => {
    if (value === "" || value === undefined) return null;
    return value;
  };

  const buildItemPayload = (userId) => ({
    userId,
    type: normalizeEnum(convertItemType(itemType)),
    color: color || null,
    pattern: normalizeEnum(convertPattern(pattern)),
    length: normalizeEnum(length),
    material: convertMaterial(material),
    bulk: convertedBulk,
    seasonWear: normalizeEnum(season),
    formality: normalizeEnum(convertFormality(formality)),
    fit: normalizeEnum(convertFit(fit)),
    // removed imageUrl here since we set it after base64 conversion
  });

  let convertedFit = convertFit(fit);

  const convertToBase64 = async (uri) => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',  // ✅ use string instead of FileSystem.EncodingType.Base64
    });
    return `data:image/jpeg;base64,${base64}`;
  };

  const submitItem = async (payload) => {
    const response = await apiClient.post("/api/items", payload);
    console.log("Submission response:", response.data);
    return response;
  };

  // Use useMutation to handle item submission with automatic loading and error states
  const { mutate, isPending } = useMutation({
    mutationFn: submitItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      Toast.show({ type: 'success', text1: 'Item added!' });
      console.log("✅ onSuccess fired:", data);
      router.replace({ pathname: "/(tabs)/closet", params: { tab: "items" } });
    },
    onError: (error) => {
      const status = error.response?.status;
      console.log("❌ onError fired:", error);
      const messages = {
        400: 'Invalid item data.',
        422: 'Image format not supported.',
        500: 'Server error. Please try again.',
      };
      Toast.show({
        type: 'error',
        text1: 'Failed to add item',
        text2: messages[status] || 'Something went wrong.',
      });
    },
  });

  const handleSubmit = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    const userId = Number(storedUserId);

    if (!Number.isInteger(userId) || userId <= 0) {
      Toast.show({ type: 'error', text1: 'Please log in again.' });
      return;
    }

    const imageData = uri ? await convertToBase64(uri) : null;
    const payload = { ...buildItemPayload(userId), imageUrl: imageData };
    mutate(payload); // useMutation handles everything from here
  };

  return (
    <>
      {/* First Page: camera */}
      {navigation.currentPage === 1 && <CameraPage setUri={setUri} setPage={goNext} uri={uri} />}

      {/* Second Page: Item Type */}
      {navigation.currentPage === 2 && (
        <CategoryPage
          setPage={goNext}
          goBack={goBack}
          itemType={itemType}
          setItemType={setItemType}
          uri={uri}
        />
      )}

      {/* Third Page: Color */}
      {navigation.currentPage === 3 && (
        <ColorPage
          setPage={goNext}
          goBack={goBack}
          color={color}
          setColor={setColor}
          pattern={pattern}
          setPattern={setPattern}
          uri={uri}
          isSolid={isSolid}
          setIsSolid={setIsSolid}
        />
      )}

      {/* Fourth Page: Formality */}
      {navigation.currentPage === 4 && (
        <EventPage
          setPage={goNext}
          goBack={goBack}
          formality={formality}
          setFormality={setFormality}
          uri={uri}
        />
      )}

      {/* Fifth Page: Material  */}
      {navigation.currentPage === 5 && (
        <MaterialPage
          setPage={goNext}
          goBack={goBack}
          material={material}
          setMaterial={setMaterial}
          uri={uri}
        />
      )}
      {/* Sixth Page: Fit */}
      {navigation.currentPage === 6 && (
        <FitPage
          setPage={goNext}
          goBack={goBack}
          itemType={itemType}
          fit={fit}
          setFit={setFit}
          uri={uri}
        />
      )}

      {/* OPTIONAL PARAMETERS: Season */}
      {navigation.currentPage === 7 && (
        <SeasonPage
          setPage={goNext}
          goBack={goBack}
          season={season}
          setSeason={setSeason}
          uri={uri}
        />
      )}

      {/* OPTIONAL PARAMETERS: Length */}
      {navigation.currentPage === 8 && (
        <LengthPage
          setPage={goNext}
          goBack={goBack}
          itemType={itemType}
          length={length}
          setLength={setLength}
          uri={uri}
        />
      )}

      {/* OPTIONAL PARAMETERS: Bulk */}
      {navigation.currentPage === 9 && (
        <BulkPage
          setPage={goNext}
          goBack={goBack}
          bulk={bulk}
          setBulk={setBulk}
          uri={uri}
        />
      )}

      {/* Eleventh Page: Review */}
      {navigation.currentPage === 10 && (
        <ReviewPage
          setPage={goNext}
          goBack={goBack}
          editField={editField}
          uri={uri}
          formality={formality}
          pattern={pattern}
          color={color}
          itemType={itemType}
          material={material}
          fit={fit}
          season={season}
          length={length}
          bulk={convertedBulk}
          handleSubmit={handleSubmit}
          isPending={isPending}
        />
      )}
    </>
  );
}

const styles = {
  navigationButtons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 40,
    justifyContent: "center",
    padding: 20,
    position: "absolute",
    bottom: 10,
    width: "100%",
  },
  Overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  togglePreviewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
};
