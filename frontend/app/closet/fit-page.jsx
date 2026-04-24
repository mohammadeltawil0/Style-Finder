import {
  Platform,
  Pressable,
  useWindowDimensions,
  ScrollView,
  View,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText, ThemedView, TogglePreview } from "../../components";
// import Slider from "@react-native-community/slider";

export default function FitPage({ setPage, goBack, itemType, fit, setFit, uri, previewMode, setPreviewMode }) {
  const theme = useTheme();

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWide = width >= 768;
  const buttonWidth = isWide ? 220 : "30%";

  const showNext = fit !== null && fit !== undefined;
  const isUpperBodyItem = itemType === "Top" || itemType === "Full Body" || itemType === "TOP" || itemType === "FULL_BODY";
  const upperOptions = [
    { id: 0, label: "Skinny", description: "Tight fit, hugs the body" },
    { id: 1, label: "Regular", description: "Standard fit, not too tight or loose" },
    { id: 2, label: "Loose", description: "Relaxed fit, more room and comfort" },
  ];
  const lowerOptions = [
    { id: 0, label: "Skinny/Bodycon", description: "Very tight fit, body-hugging" },
    { id: 1, label: "Regular", description: "Straight fit, not too tight or loose" },
    { id: 2, label: "Baggy", description: "Loose fit, lots of room" },
  ];
  const options = isUpperBodyItem ? upperOptions : lowerOptions;

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
            <TogglePreview uri={uri} previewMode={previewMode} setPreviewMode={setPreviewMode} />
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
                Between the three options, describe the fit of this item
              </ThemedText>
            </View>
            <View className="fitOptionsView" style={{ gap: 16, width: "100%", alignItems: "center" }}>
              {options.map((option) => {
                const isSelected = Math.round(fit) === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setFit(option.id)}
                    style={[
                      {
                        backgroundColor: isSelected ? theme.colors.tabIconSelected : theme.colors.lightBrown,
                        borderRadius: 10,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        width: isWide ? 400 : "100%",
                        shadowColor: isSelected ? "#000" : undefined,
                        shadowOffset: isSelected ? { width: 0, height: 5 } : undefined,
                        shadowOpacity: isSelected ? 0.2 : undefined,
                        shadowRadius: isSelected ? 3.5 : undefined,
                        elevation: isSelected ? 5 : undefined,
                      },
                    ]}
                  >
                    <ThemedText
                      style={{
                        color: theme.colors.text,
                        fontSize: theme.sizes.h3,
                        fontFamily: theme.fonts.bold,
                        textAlign: "flex-start",
                      }}
                    >
                      {option.label}
                    </ThemedText>
                    <ThemedText
                      style={{
                        fontSize: 16,
                        opacity: 0.8,
                        marginTop: 4,
                        fontFamily: theme.fonts.regular,
                        color: theme.colors.text,
                      }}
                    >
                      {option.description}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.navigationButtons,
          isWeb && styles.navigationButtonsWeb,
          !showNext && styles.navigationButtonsSingle,
        ]}
      >
        <Pressable
          onPress={() => goBack()}
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            padding: 10,
            width: buttonWidth,
          }}
        >
          <ThemedText style={{ textAlign: "center" }}>Back</ThemedText>
        </Pressable>
        {showNext && (
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: buttonWidth,
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
    gap: 30,
    position: "relative",
  },
  mainContent: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "column",
    gap: 30
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
    width: 220,
  },
};
