import {
  Platform,
  Pressable,
  useWindowDimensions,
  ScrollView,
  View
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText, ThemedView, TogglePreview } from "../../components";

export default function SeasonPage({ season, setSeason, setPage, uri}) {
  const theme = useTheme();
  const seasonOptions = [
    {
      id: "ALL_SEASONS",
      label: "All Seasons",
      emoji: "🌦️",
      subheader: "Versatile for year-round wear",
    },
    {
      id: "WINTER",
      label: "Winter",
      emoji: "❄️",
      subheader: "Warm and layered outfits",
    },
    {
      id: "SPRING",
      label: "Spring",
      emoji: "🌷",
      subheader: "Light and breezy outfits",
    },
    {
      id: "SUMMER",
      label: "Summer",
      emoji: "☀️",
      subheader: "Light and breezy outfits",
    },
    {
      id: "FALL",
      label: "Fall",
      emoji: "🍂",
      subheader: "Cozy and layered outfits",
    }
  ];

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWide = width >= 768;
  const buttonWidth = isWide ? 220 : "30%";

  return (
    <ThemedView
      gradient={true}
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isWide && styles.scrollContentWide,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.contentContainer
          ]}
        >
          <View style={styles.togglePreviewContainer}
            pointerEvents="box-none">
            <TogglePreview setPage={setPage} uri={uri} />
          </View>

          <View
            className="mainContent"
            style={styles.mainContent}
          >
            <View
              className="question"
              style={[
                styles.textBlock,
                !uri && styles.textBlockNoImage,
                isWide && styles.textBlockWide,
              ]}
            >
              <ThemedText
                style={{
                  fontSize: theme.sizes.h1,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bold,
                }}
              >
                What kind of season is this item for?
              </ThemedText>
            </View>
            <View
              className="seasonOptionsView"
              style={{ alignItems: "center", justifyContent: "center", gap: 12, paddingBottom: 20, width: "100%" }}
            >
              <View style={styles.seasonOptions}>
                {seasonOptions.map((option) => {
                  const isSelected = season === option.id;

                  return (
                    <Pressable
                      onPress={() => {
                        if (isSelected) {
                          setSeason("");
                        } else {
                          setSeason(option.id);
                        }
                      }}
                      key={option.id}
                      style={[
                        isSelected && styles.selectedEventOptionButton,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.tabIconSelected
                            : theme.colors.lightBrown,
                          borderRadius: 10,
                          paddingHorizontal: 24,
                          paddingVertical: 12,
                          width: "100%",
                        },
                      ]}
                    >
                      <ThemedText
                        style={{
                          color: theme.colors.text,
                          fontSize: theme.sizes.h3,
                          color: theme.colors.text,
                          fontFamily: theme.fonts.bold,
                        }}
                      >
                        {option.emoji} {option.label}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.optionSubheader,
                        ]}
                      >
                        {option.subheader}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>


      <View style={styles.navigationButtons}>
        <Pressable
          onPress={() => setPage(6)}
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
        {season && (
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: "35%",
            }}
            onPress={() => setPage(8)}
          >
            <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = {
  seasonOptions: {
    gap: 12,
    justifyContent: "center",
    width: "100%",
  },
  optionSubheader: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: "flex-start",
    marginTop: 4,
  },
  selectedEventOptionButton: {
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    elevation: 5,
    width: "100%",
  },
  navigationButtons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 40,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 30,
    width: "100%",
    flexWrap: "wrap",
  },
  navigationButtonsWeb: {
    paddingBottom: 28,
    marginLeft: 10
  },
  navigationButtonsSingle: {
    justifyContent: "center",
  },
  togglePreviewContainer: {
    position: "relative",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  scrollContentWide: {
    alignItems: "center",
  },
  contentContainer: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    justifyContent: "center",
    gap: 8,
    position: "relative",
  },
  mainContent: {
    justifyContent: "center",
    paddingBottom: 16,
  },
  textBlock: {
    paddingBottom: 20,
    zIndex: 1,
  },
  textBlockNoImage: {
    marginTop: 8,
  },
  textBlockWide: {
    paddingHorizontal: 0,
  },
};
