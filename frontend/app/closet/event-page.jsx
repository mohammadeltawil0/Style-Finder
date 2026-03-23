import { Pressable, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText, ThemedView, TogglePreview } from "../../components";

export default function EventPage({ setPage, events, setEvents, uri }) {
  const theme = useTheme();
  const eventOptions = [
    "Versatile",
    "Casual",
    "Work/Smart",
    "Party/Night Out",
    "Formal",
    "Active/Sport",
    //TO DO: add icons, and maybe add a seasonal or something else
  ];

  return (
    <ThemedView
      gradient={true}
      style={{
        flex: 1,
      }}
    >
      <View style={styles.togglePreviewContainer} pointerEvents="box-none">
        <TogglePreview setPage={setPage} uri={uri} />
      </View>

      <View
        className="mainContent"
        style={{ flex: 1, justifyContent: "center", marginBottom: 246 }}
      >
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
          style={{ alignItems: "center", justifyContent: "center" }}
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
  );
}

const styles = {
  colorOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  colorOptionButton: {
    borderRadius: 10,
    minWidth: "42%",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectedColorOptionButton: {
    borderWidth: 2,
    borderColor: "#00000033",
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
