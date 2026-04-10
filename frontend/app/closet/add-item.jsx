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
import {apiClient} from "../../scripts/apiClient";


export default function AddItemScreen() {
  const [page, setPage] = useState(1);
  const [uri, setUri] = useState(null);

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
      const userId = parseInt(await AsyncStorage.getItem("userId"), 10);
      const itemData = {
          userId: userId,
          type: itemType || null,
          color: color || null,
          pattern: convertPattern(pattern),
          length: length || null,
          material: material || null,
          bulk: bulk || null,
          seasonWear: season || null,
          formality: formality || null,
          fit: convertFit(fit),
          imageUrl: uri || null,
      };
    try {
      console.log("Submitting perfectly mapped DTO:", itemData);
      const response = await apiClient.post(`/api/items/add`, itemData);

      alert("Item submitted successfully!");
      router.replace("/closet");

    } catch (error) {
      console.error("Error submitting item:", error);
      alert("Failed to submit item. Please try again." + JSON.stringify(itemData));
    }
  };

  return (
    <>
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

      {/* OPTIONAL PARAMETERS: Season */}
      {page === 7 && (
        <SeasonPage
          setPage={setPage}
          season={season}
          setSeason={setSeason}
          uri={uri}
        />
      )}

      {/* OPTIONAL PARAMETERS: Length */}
      {page === 8 && (
        <LengthPage
          setPage={setPage}
          itemType={itemType}
          length={length}
          setLength={setLength}
          uri={uri}
        />
      )}

      {/* OPTIONAL PARAMETERS: Bulk */}
      {page === 9 && (
        <BulkPage
          setPage={setPage}
          bulk={bulk}
          setBulk={setBulk}
          uri={uri}
        />
      )}

      {/* Eleventh Page: Review */}
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
