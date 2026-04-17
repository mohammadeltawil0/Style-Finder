import { useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
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


export default function AddItemScreen() {
  const [page, setPage] = useState(1);
  const [uri, setUri] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // These states now natively hold Java Enum strings from their child pages
  const [itemType, setItemType] = useState("");
  const [formality, setFormality] = useState("");
  const [material, setMaterial] = useState("");
  const [season, setSeason] = useState("");
  const [length, setLength] = useState("");
  const [color, setColor] = useState("");
  const [bulk, setBulk] = useState(1); // Slider: 0 to 2

  // These states hold UI values that must be mapped before submission
  const [pattern, setPattern] = useState("");
  const [isSolid, setIsSolid] = useState(false);
  const [fit, setFit] = useState(1);  // Slider: 0 to 2

  const router = useRouter();

  // Convert states to match backend
  //1. Convert fit
  // TO DO: convert 0.1 steps to enums to match our Fit Model

  const convertFit = (fit) => {
    if (fit < 0.5) return "SLIM";
    if (fit < 1.5) return "REGULAR";
    return "LOOSE";
  };

  const convertPattern = (pattern) => {
    const map = {
      "Solid": "SOLID",
      "Striped": "STRIPED",
      "Plaid": "PLAID_OR_FLANNEL",
      "Floral": "FLORAL",
      "GRAPHIC": "GRAPHIC",
      "GEOMETRIC": "GEOMETRIC_OR_ABSTRACT",
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
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    let finalImageUrl = uri;

    try {
      if (uri && !uri.startsWith('http')) {

        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        console.log("Filename:", filename);
        console.log("Type:", type);
        console.log("Requesting VIP Pass (Pre-signed URL) from Spring Boot...");

        const urlResponse = await apiClient.get(
            `/api/upload/presigned-url?filename=${filename}&contentType=${type}`);

        const { uploadUrl, publicUrl } = urlResponse.data;
        console.log("Uploading directly to Backblaze...");

        const response = await fetch(uri);
        const blob = await response.blob();

        // D. Upload to Backblaze using the temporary URL
        const backblazeResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': type,
          },
        });
        if (!backblazeResponse.ok) {
          const errorText = await backblazeResponse.text;
          console.error("Backblaze upload failed:", errorText);
        }

        finalImageUrl = publicUrl;
        console.log("Success! Hosted permanently at:", finalImageUrl);
      }

      // 2. SAVE THE ITEM TO THE DATABASE
      const userId = parseInt(await AsyncStorage.getItem("userId"), 10);
      const itemData = {
        userId: userId,
        type: itemType ? convertItemType(itemType) : null,
        color: color || null,
        pattern: convertPattern(pattern),
        length: length || null,
        material: material || null,
        bulk: bulk || null,
        seasonWear: season || null,
        formality: formality || null,
        fit: convertFit(fit),
        imageUrl: finalImageUrl || null, // Now using the permanent Backblaze URL
      };

      console.log("Submitting perfectly mapped DTO:", itemData);
      await apiClient.post(`/api/items/add`, itemData);

      alert("Item submitted successfully!");
      router.replace("/closet");

    } catch (error) {
      console.error("Error submitting item:", error);
      alert("Failed to submit item. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
      <View style={{ flex: 1 }}>
      {/* First Page: camera */}
      {page === 1 && <CameraPage setUri={setUri} setPage={setPage} uri={uri} />}

      {/* Second Page: Item Type */}
      {page === 2 && (
        <CategoryPage
          setPage={setPage}
          itemType={itemType}
          setItemType={setItemType}
          uri={uri}
        />
      )}

      {/* Third Page: Color */}
      {page === 3 && (
        <ColorPage
          setPage={setPage}
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
      {page === 4 && (
        <EventPage
          setPage={setPage}
          formality={formality}
          setFormality={setFormality}
          uri={uri}
        />
      )}

      {/* Fifth Page: Material  */}
      {page === 5 && (
        <MaterialPage
          setPage={setPage}
          material={material}
          setMaterial={setMaterial}
          uri={uri}
        />
      )}
      {/* Sixth Page: Fit */}
      {page === 6 && (
        <FitPage
          setPage={setPage}
          itemType={itemType}
          fit={fit}
          setFit={setFit}
          uri={uri}
        />
      )}

      {/* Seventh Page: Season */}
      {page === 7 && (
        <SeasonPage
          setPage={setPage}
          season={season}
          setSeason={setSeason}
          uri={uri}
        />
      )}

      {/* Eighth Page: Length */}
      {page === 8 && (
        <LengthPage
          setPage={setPage}
          itemType={itemType}
          length={length}
          setLength={setLength}
          uri={uri}
        />
      )}

      {/* Ninth Page: Bulk */}
      {page === 9 && (
        <BulkPage
          setPage={setPage}
          bulk={bulk}
          setBulk={setBulk}
          uri={uri}
        />
      )}

      {/* Tenth Page: Review */}
      {page === 10 && (
        <ReviewPage
          setPage={setPage}
          uri={uri}
          formality={formality}
          pattern={pattern}
          color={color}
          itemType={itemType}
          material={material}
          fit={fit}
          season={season}
          length={length}
          bulk={bulk}
          handleSubmit={handleSubmit}
        />
      )}
      {isUploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#b49480" />
            <Text style={styles.loadingText}>Uploading to Wardrobe...</Text>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // Ensure it sits on top of everything
  },
  loadingText: {
    color: "#fff",
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
  }
});