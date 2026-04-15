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

export default function BulkPage({
  bulk,
  setBulk,
  setPage,
  goBack,
  uri,
  previewMode,
  setPreviewMode,
}) {
  const theme = useTheme();
  const options = [
    "Thick",
    "Regular",
    "Thin",
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
                How bulky is this item?
              </ThemedText>
              <ThemedText style={{ fontSize: theme.sizes.h3 }}>
                Is this item thick, thin, or something in between?
              </ThemedText>
            </View>
            <View
              className="bulkOptionsView"
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <View style={styles.bulkOptions}>
                <View
                  className="sliderLabelsView"
                  style={styles.sliderLabelsView}
                >
                  <View
                    className="bulkLabels"
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      paddingHorizontal: 4,
                      alignItems: "flex-end",
                    }}
                  >
                    {options.map((option, index) => (
                      <ThemedText key={index} style={{ textAlign: "flex-end" }}>
                        {option}
                      </ThemedText>
                    ))}
                  </View>
                  <View className="sliderView" style={styles.sliderView}>
                    <Slider
                      // style={{ width: 220, height: 40 }}
                      minimumTrackTintColor={theme.colors.tabIconSelected}
                      maximumTrackTintColor={theme.colors.lightBrown}
                      thumbTintColor={theme.colors.tabIconSelected}
                      minimumValue={0}
                      maximumValue={2}
                      step={0.25}
                      value={bulk}
                      onValueChange={(value) => {
                        setBulk(value);
                        console.log("bulk", value);
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <Pressable
          onPress={() => goBack()}
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
        <Pressable
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            padding: 10,
            width: "35%",
          }}
          onPress={() => setPage(10)}
        >
          <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = {
  bulkOptions: {
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
  sliderLabelsView: {
    height: 300,
    justifyContent: "center",
  }
};
