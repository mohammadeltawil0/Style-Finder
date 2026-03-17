import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { Keyboard, Modal, Pressable, TextInput, View } from "react-native";
import Octicons from "react-native-vector-icons/Octicons";
import {
  Camera,
  ThemedText,
  ThemedView,
  TogglePreview,
} from "../../components";

//TO DO: maybe put individual pages to separate files
export default function AddItemScreen() {
  const [page, setPage] = useState(1);
  const [uri, setUri] = useState(null);
  const [category, setCategory] = useState("");
  const [colors, setColors] = useState([]);
  const [openOtherModal, setOpenOtherModal] = useState(false);
  const [events, setEvents] = useState([]); //TO DO: do we want one option or multi select
  const theme = useTheme();

  const colorOptions = [
    { name: "Red", hex: "#CB0202" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Yellow", hex: "#FFD700" },
    { name: "Green", hex: "#2E8B57" },
    { name: "Blue", hex: "#1E90FF" },
    { name: "Purple", hex: "#800080" },
    { name: "Pink", hex: "#FF69B4" },
    { name: "Gray", hex: "#808080" },
    { name: "Brown", hex: "#8B4513" },
    { name: "Black", hex: "#111111" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Other", hex: "#808080" }, // TO DO: find a better color for "Other"
  ];

  const eventOptions = [
    "Versatile",
    "Casual",
    "Work/Smart",
    "Party/Night Out",
    "Formal",
    "Active/Sport",
    //TO DO: add icons, and maybe add a seasonal or something else
  ];

  console.log("uri: ", uri);
  console.log("category: ", category);
  console.log("colors: ", colors);
  console.log("openOtherModal: ", openOtherModal);
  console.log("page: ", page);

  const OtherModal = () => {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={openOtherModal}
        onRequestClose={() => setOpenOtherModal(false)}
      >
        <View style={styles.otherModalOverlay}>
          <ThemedView
            style={[
              styles.otherModalCard,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <ThemedText style={styles.otherModalTitle}>
                Enter a Custom Shade:
              </ThemedText>
              <Pressable
                onPress={() => {
                  setOpenOtherModal(false);
                  setColors((prev) => prev.filter((c) => c !== "Other"));
                }}
              >
                <Octicons name="x" color="#000" size={24} />
              </Pressable>
            </View>
            <TextInput
              placeholder="e.g. Burgundy"
              placeholderTextColor="#888"
              style={styles.otherModalInput}
            />

            <Pressable
              style={styles.otherModalSubmit}
              onPress={() => {
                Keyboard.dismiss();
                setOpenOtherModal(false);
              }}
            >
              <ThemedText style={{ textAlign: "center" }}>Submit</ThemedText>
            </Pressable>
          </ThemedView>
        </View>
      </Modal>
    );
  };

  return (
    <>
      {/* First Page: camera */}
      {page === 1 && (
        <ThemedView
          gradient={true}
          style={{ backgroundColor: theme.colors.background, flex: 1 }}
        >
          <View style={{ paddingHorizontal: 30, paddingTop: 30, zIndex: 1 }}>
            <ThemedText
              style={{
                fontSize: theme.sizes.h2,
                color: theme.colors.text,
                textAlign: "center",
              }}
            >
              Take a clear photo of the item you want to add.
            </ThemedText>
          </View>
          <Camera setUri={setUri} setPage={setPage} uri={uri} />
        </ThemedView>
      )}

      {page === 2 && (
        <ThemedView
          gradient={true}
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            justifyContent: "center",
          }}
        >
          <View style={styles.togglePreviewContainer} pointerEvents="box-none">
            <TogglePreview setPage={setPage} uri={uri} />
          </View>

          <View
            className="question"
            style={{
              marginTop: !uri ? -50 : 0,
              paddingHorizontal: 30,
              paddingBottom: 30,
              zIndex: 1,
              marginTop: !uri ? -50 : 0,
              paddingHorizontal: 30,
              paddingBottom: 30,
              zIndex: 1,
            }}
          >
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                color: theme.colors.text,
                fontFamily: theme.fonts.bold,
              }}
            >
              What category is
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                color: theme.colors.text,
                fontFamily: theme.fonts.bold,
                paddingBottom: 20,
              }}
            >
              this item for?
            </ThemedText>
          </View>

          <View
            className="categoryOptions"
            style={{
              alignItems: "center",
              flexDirection: "column",
              gap: 50,
              paddingHorizontal: 30,
              paddingBottom: 20,
              width: "100%",
            }}
          >
            <Pressable
              onPress={() => setCategory("Top")}
              style={{
                backgroundColor:
                  category === "Top"
                    ? theme.colors.tabIconSelected
                    : theme.colors.lightBrown,
                borderRadius: 10,
                paddingHorizontal: 30,
                paddingVertical: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.2,
                shadowRadius: 3.5,
                elevation: 5,
                width: "100%",
              }}
            >
              <View
                className="optionTitle"
                style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
              >
                <Ionicons name="shirt" size={24} color="black" />
                <ThemedText
                  style={{
                    fontSize: theme.sizes.h2,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Top
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: theme.sizes.text,
                  color: theme.colors.text,
                  paddingTop: 10,
                }}
              >
                T-shirts, graphic tees, you name it!
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setCategory("Bottom")}
              style={{
                backgroundColor:
                  category === "Bottom"
                    ? theme.colors.tabIconSelected
                    : theme.colors.lightBrown,
                borderRadius: 10,
                paddingHorizontal: 30,
                paddingVertical: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.2,
                shadowRadius: 3.5,
                elevation: 5,
                width: "100%",
              }}
            >
              <View
                className="optionTitle"
                style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
              >
                {/* TO DO: find a bottoms logo */}
                <Ionicons name="shirt" size={24} color="black" />
                <ThemedText
                  style={{
                    fontSize: theme.sizes.h2,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Bottom
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: theme.sizes.text,
                  color: theme.colors.text,
                  paddingTop: 10,
                }}
              >
                Low rise, mid rise, high rise to flared, skinny, and wide!
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setCategory("Full Body")}
              style={{
                backgroundColor:
                  category === "Full Body"
                    ? theme.colors.tabIconSelected
                    : theme.colors.lightBrown,
                borderRadius: 10,
                paddingHorizontal: 30,
                paddingVertical: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.2,
                shadowRadius: 3.5,
                elevation: 5,
                width: "100%",
              }}
            >
              <View
                className="optionTitle"
                style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
              >
                <FontAwesome6 name="person-dress" size={24} color="black" />
                <ThemedText
                  style={{
                    fontSize: theme.sizes.h2,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Full Body
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: theme.sizes.text,
                  color: theme.colors.text,
                  paddingTop: 10,
                }}
              >
                Jumpsuits, rompers, dresses, and all things full body!
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.navigationButtons}>
            <Pressable
              onPress={() => setPage(1)}
              //TO DO: if next is not visible, make this flex-start or figure it out
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 10,
                padding: 10,
                width: "35%",
              }}
            >
              <ThemedText style={{ textAlign: "center" }}>Back</ThemedText>
            </Pressable>
            {category && (
              <Pressable
                style={{
                  backgroundColor: theme.colors.card,
                  borderRadius: 10,
                  padding: 10,
                  width: "35%",
                }}
                onPress={() => setPage(3)}
              >
                <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
              </Pressable>
            )}
          </View>
        </ThemedView>
      )}

      {page === 3 && (
        <ThemedView
          gradient={true}
          style={{
            backgroundColor: theme.colors.background,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <View style={styles.togglePreviewContainer} pointerEvents="box-none">
            <TogglePreview setPage={setPage} uri={uri} />
          </View>
          <View
            className="question"
            style={{
              marginTop: !uri ? -50 : 0,
              paddingHorizontal: 30,
              paddingBottom: 30,
              zIndex: 1,
            }}
          >
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                color: theme.colors.text,
                fontFamily: theme.fonts.bold,
              }}
            >
              What kind of colors
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                color: theme.colors.text,
                fontFamily: theme.fonts.bold,
                paddingBottom: 20,
              }}
            >
              does this item have?
            </ThemedText>
          </View>

          <View
            className="colorOptionsView"
            style={{ alignItems: "center", justifyContent: "center" }}
          >
            <View style={styles.colorOptionsGrid}>
              {colorOptions.map((color) => {
                const isSelected = colors.includes(color.name);

                return (
                  <Pressable
                    onPress={() => {
                      if (color.name === "Other") {
                        if (isSelected) {
                          setColors((prev) =>
                            prev.filter((c) => c !== color.name),
                          );
                          setOpenOtherModal(false);
                        } else {
                          setColors((prev) => [...prev, color.name]);
                          setOpenOtherModal(true);
                        }
                        return;
                      }

                      if (isSelected) {
                        setColors((prev) =>
                          prev.filter((c) => c !== color.name),
                        );
                      } else {
                        setColors((prev) => [...prev, color.name]);
                      }
                    }}
                    key={color.name}
                    style={[
                      styles.colorOptionButton,
                      isSelected && styles.selectedColorOptionButton,
                      { backgroundColor: color.hex },
                    ]}
                  >
                    <ThemedText
                      style={{
                        textAlign: "center",
                        color: color.name === "White" ? "#000000" : "#FFFFFF",
                      }}
                    >
                      {color.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.navigationButtons}>
            <Pressable
              onPress={() => setPage(2)}
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 10,
                padding: 10,
                width: "35%",
              }}
            >
              <ThemedText style={{ textAlign: "center" }}>Back</ThemedText>
            </Pressable>
            <Pressable
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 10,
                padding: 10,
                width: "35%",
              }}
              onPress={() => setPage(4)}
            >
              <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}

      {/* TO DO: fix the page 4; not rendering  */}
      {page === 4 && (
        <ThemedView
          gradient={true}
          style={{
            flex: 1,
            backgroundColor: theme.colors.background,
            justifyContent: "center",
          }}
        >
          <View style={styles.togglePreviewContainer} pointerEvents="box-none">
            <TogglePreview setPage={setPage} uri={uri} />
          </View>

          <View
            className="question"
            style={{
              marginTop: !uri ? -50 : 0,
              paddingHorizontal: 30,
              paddingBottom: 30,
              zIndex: 1,
            }}
          >
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                color: theme.colors.text,
                fontFamily: theme.fonts.bold,
              }}
            >
              What kind of event
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                color: theme.colors.text,
                fontFamily: theme.fonts.bold,
                paddingBottom: 20,
              }}
            >
              is this item for?
            </ThemedText>
          </View>
          <View
            className="eventOptionsView"
            style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
          >
            {/* TO DO: try out flex direction column and/or add description */}
            <View style={styles.colorOptionsGrid}>
              {eventOptions.map((event) => {
                const isSelected = events.includes(event);

                return (
                  <Pressable
                    onPress={() => {
                      if (isSelected) {
                        setEvents((prev) => prev.filter((e) => e !== event));
                      } else {
                        setEvents((prev) => [...prev, event]);
                      }
                    }}
                    key={event}
                    style={[
                      styles.colorOptionButton,
                      isSelected && styles.selectedColorOptionButton,
                      { backgroundColor: theme.colors.lightBrown },
                    ]}
                  >
                    <ThemedText
                      style={{
                        textAlign: "center",
                        color: theme.colors.text,
                      }}
                    >
                      {event}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.navigationButtons}>
            <Pressable
              onPress={() => setPage(3)}
              //TO DO: if next is not visible, make this flex-start or figure it out
              style={{
                backgroundColor: theme.colors.card,
                borderRadius: 10,
                padding: 10,
                width: "35%",
              }}
            >
              <ThemedText style={{ textAlign: "center" }}>Back</ThemedText>
            </Pressable>
            {events && (
              <Pressable
                style={{
                  backgroundColor: theme.colors.card,
                  borderRadius: 10,
                  padding: 10,
                  width: "35%",
                }}
                onPress={() => setPage(5)}
              >
                <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
              </Pressable>
            )}
          </View>
        </ThemedView>
      )}
      <OtherModal />
    </>
  );
}

const styles = {
  colorOptionButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  colorOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 260,
    gap: 20,
    justifyContent: "center",
  },
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
  otherModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  otherModalCard: {
    width: "80%",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  otherModalTitle: {
    fontSize: 16,
  },
  otherModalInput: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: "#000",
  },
  otherModalSubmit: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#e9e9e9",
  },
  selectedColorOptionButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#000000",
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
