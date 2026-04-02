import {
  Platform,
  Pressable,
  useWindowDimensions,
  ScrollView,
  View,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText, ThemedView, TogglePreview } from "../../components";
import Slider from "@react-native-community/slider";

export default function FitPage({ setPage, itemType, fit, setFit, uri }) {
  const theme = useTheme();

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWide = width >= 768;
  const buttonWidth = isWide ? 220 : "30%";

  const upperOptions = ["Skinny", "Regular", "Loose"];

  const lowerOptions = [
    "Skinny/Bodycon",
    // "Slim fit",
    "Straight",
    // "Relaxed",
    "Baggy/Wide leg", // equivalent to loose
  ];

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
        <View style={[styles.contentContainer]}>
          <View style={styles.togglePreviewContainer} pointerEvents="box-none">
            <TogglePreview setPage={setPage} uri={uri} />
          </View>
          <View className="mainContent" style={styles.mainContent}>
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
                What is the fit of
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h1,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bold,
                }}
              >
                the item?
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h3,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.regular,
                }}
              >
                On a scale from 0 to 1, describe the fit of this item
              </ThemedText>
            </View>
            <View className="sliderLabelsView" style={styles.sliderLabelsView}>
              {/* TO DO: remove the gap between slider and labels */}
              <View
                className="fitLabels"
                style={{
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 220,
                  paddingHorizontal: 4,
                  alignItems: "flex-end",
                }}
              >
                {itemType === "Top" ||
                itemType === "Full Body"
                  ? upperOptions.map((option, index) => (
                      <ThemedText key={index} style={{ textAlign: "flex-end" }}>
                        {option}
                      </ThemedText>
                    ))
                  : lowerOptions.map((option, index) => (
                      <ThemedText key={index} style={{ textAlign: "flex-end" }}>
                        {option}
                      </ThemedText>
                    ))}
              </View>
              <View className="sliderView" style={styles.sliderView}>
                <Slider
                  style={{ width: 220, height: 40 }}
                  minimumTrackTintColor={theme.colors.tabIconSelected}
                  maximumTrackTintColor={theme.colors.lightBrown}
                  thumbTintColor={theme.colors.tabIconSelected}
                  minimumValue={0}
                  maximumValue={2}
                  step={0.1}
                  value={fit}
                  onValueChange={(value) => {
                    setFit(value);
                    console.log("fit", value);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <Pressable
          onPress={() => setPage(5)}
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
        {fit !== null && fit !== undefined && (
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: "35%",
            }}
            onPress={() => setPage(7)}
          >
            <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = {
  optionsGrid: {
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
  selectedOption: {
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
    marginLeft: 10,
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
    // minHeight: "100%",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  scrollContentWide: {
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    justifyContent: "center",
    gap: 8,
    position: "relative",
  },
  mainContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  textBlock: {
    alignSelf: "flex-start",
    // paddingBottom: 20,
    zIndex: 1,
    flexShrink: 0,
  },
  textBlockNoImage: {
    marginTop: 8,
  },
  textBlockWide: {
    paddingHorizontal: 0,
  },
  sliderLabelsView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: "100%",
  },
  sliderView: {
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "90deg" }],
    width: "fit-content",
  },
};
