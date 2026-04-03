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


export default function AddItemScreen() {
  const [page, setPage] = useState(1);
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

  const router = useRouter();

  // Convert states to match backend
  //1. Convert fit
  // TO DO: convert 0.1 steps to enums to match our Fit Model
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
      "GRAPHIC": "GRAPHIC",
      "GEOMETRIC": "GEOMETRIC",
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

  // const convertLength = (length) => {
  //   const map = {
  //   "Sleeveless": "SLEEVELESS",
  //   "Cap": "CAP",
  //   "Short-Sleeve": "SHORT_SLEEVE",
  //   "Three-Quarter": "THREE_QUARTER",
  //   "Long-Sleeve": "LONG_SLEEVE",
  //   "Above-Knee": "ABOVE_KNEE",
  //   "Knee-Length-Bermuda": "KNEE_LENGTH_OR_BERMUDA",
  //   "Midi-Capri": "MIDI_or_CAPRI",
  //   "Full-Length-Maxi": "MAXI_OR_FULL_LENGTH",
  // };

  //   return map[length] || null;
  // };

  // const convertSeason = (season) => {
  // const map = {
  //   "All-Seasons": "ALL_SEASONS",
  //   "Winter": "WINTER",
  //   "Spring": "SPRING",
  //   "Summer": "SUMMER",
  //   "Fall": "FALL",
  // };

  // return map[season] || null;
  // };    

  const convertMaterial = (material) => {
    return material ? Number(material) : null; // Convert material to number or return null if not set
  };

  let convertedFit = convertFit(fit);

  const handleSubmit = async () => {
    // TO DO: submit to backend, and navigate to inventory page!
    // router.push({
    //   pathname: "/closet",
    //   params: { tab: "inventory" },
    // });

    try {
      const userId = await AsyncStorage.getItem("userId");
      const itemData = {
        userId: Number(userId),
        type: convertItemType(itemType),
        color: color || null,
        pattern: convertPattern(pattern),
        length: length ? length : null, // Handle optional length
        material: convertMaterial(material),
        bulk: convertedBulk,
        seasonWear: season || null, // Handle optional season
        formality: convertFormality(formality),
        fit: convertFit(fit),
        imageUrl: uri ? uri : null, // Handle optional image
      };
      
      console.log("Submitting item data:", itemData); // Log the data being submitted

      const response = await fetch(`http://localhost:8080/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        alert("Failed to submit item. Please try again." + JSON.stringify(itemData));
        throw new Error("Failed to submit item");
      } 
      
      alert("Item submitted successfully!");
      router.push({
        pathname: "/closet",
        params: { tab: "inventory" },
      });

    } catch (error) {
      console.error("Error submitting item:", error);
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
          bulk={convertedBulk}
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
