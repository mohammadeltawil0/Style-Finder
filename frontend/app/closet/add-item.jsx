import { useState } from "react";
import CameraPage from "./camera-page.jsx";
import CategoryPage from "./category-page.jsx";
import ColorPage from "./color-page.jsx";
import EventPage from "./event-page.jsx";
import ReviewPage from "./review-page.jsx";

export default function AddItemScreen() {
  const [page, setPage] = useState(1);
  const [uri, setUri] = useState(null);
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [event, setEvent] = useState(""); //TO DO: do we want one option or multi select

  return (
    <>
      {/* First Page: camera */}
      {page === 1 && (
        <CameraPage setUri={setUri} setPage={setPage} uri={uri} />
      )}

      {page === 2 && (
        <CategoryPage
          setPage={setPage}
          category={category}
          setCategory={setCategory}
          uri={uri}
        />
      )}

      {page === 3 && (
        <ColorPage setPage={setPage} color={color} setColor={setColor} pattern={pattern} setPattern={setPattern} uri={uri} />
      )}

      {/* TO DO: fix the page 4; not rendering  */}
      {page === 4 && (
        <EventPage setPage={setPage} event={event} setEvent={setEvent} uri={uri} />
      )}

      {/* TO DO: add more things here! */}
      {page === 5 && (
        <ReviewPage setPage={setPage} uri={uri} event={event} pattern={pattern} color={color} category={category} />
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
