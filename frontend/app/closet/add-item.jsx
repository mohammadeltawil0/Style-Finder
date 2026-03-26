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

export default function AddItemScreen() {
  const [page, setPage] = useState(1);
  const [uri, setUri] = useState(null);
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [event, setEvent] = useState(""); //TO DO: do we want one option or multi select
  const [isSolid, setIsSolid] = useState(false); // handle in root so global; true if pressed next after "solid" button
  const [material, setMaterial] = useState("");
  const [fit, setFit] = useState(1);
  const [season, setSeason] = useState(""); //TO DO: do we want one option or multi select
  const [length, setLength] = useState("");
  const [bulk, setBulk] = useState(1); // default to middle value of 1, range from 0-2 (0: thin, 1: medium, 2: thick)

  const router = useRouter();

  // Convert states to match backend
  //1. Convert fit
  // TO DO: convert 0.1 steps to enums to match our Fit Model
  let convertedFit = 0;
  let convertedBulk = 0;

  fit >= 0 && fit < 0.5
    ? (convertedFit = 0)
    : fit >= 0.5 && fit < 1.5
      ? (convertedFit = 1)
      : (convertedFit = 2);

  bulk >= 0 && bulk <= 0.50
    ? (convertedBulk = 0)
    : bulk >= 0.51 && bulk < 1.49
      ? (convertedBulk = 1)
      : (convertedBulk = 2);

  console.log("category: ", category, " pattern: ", pattern, " color: ", color, " event: ", event, " material: ", material, " fit: ", fit, " season: ", season, " length: ", length, " bulk: ", bulk);

  const handleSubmit = () => {
    // TO DO: submit to backend, and navigate to inventory page!
    router.push({
      pathname: "/closet",
      params: { tab: "inventory" },
    });
  };

  return (
    <>
      {/* First Page: camera */}
      {page === 1 && <CameraPage setUri={setUri} setPage={setPage} uri={uri} />}

      {/* Second Page: Category */}
      {page === 2 && (
        <CategoryPage
          setPage={setPage}
          category={category}
          setCategory={setCategory}
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

      {/* Fourth Page: Event */}
      {page === 4 && (
        <EventPage
          setPage={setPage}
          event={event}
          setEvent={setEvent}
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
          category={category}
          fit={fit}
          setFit={setFit}
          uri={uri}
        />
      )}

      {/* TO DO: TO BE IMPLEMENTED */}
      {/* OPTIONAL PARAMETERS: Season */}
      {page === 7 && (
        <SeasonPage
          setPage={setPage}
          category={category}
          season={season}
          setSeason={setSeason}
          uri={uri}
        />
      )}

      {/* OPTIONAL PARAMETERS: Length */}
      {page === 8 && (
        <LengthPage
          setPage={setPage}
          category={category}
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
          event={event}
          pattern={pattern}
          color={color}
          category={category}
          material={material}
          fit={convertedFit}
          handleSubmit={handleSubmit}
          length={length}
          bulk={convertedBulk}
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
