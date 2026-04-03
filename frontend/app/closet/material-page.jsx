import {
  Platform,
  Pressable,
  useWindowDimensions,
  ScrollView,
  View,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText, ThemedView, TogglePreview } from "../../components";

export default function MaterialPage({ setPage, material, setMaterial, uri }) {
  const theme = useTheme();
  const materialOptions = [
    {
      id: 1,
      label: "Cotton",
      subheader: "Soft, breathable, and great for everyday wear",
    },
    {
      id: 2,
      label: "Linen/Hemp",
      subheader: "Lightweight and breathable for hot weather",
    },
    {
      id: 3,
      label: "Wool/Fleece",
      subheader: "Warm and insulating for sweaters and coats",
    },
    {
      id: 4,
      label: "Silk/Satin",
      subheader: "Smooth, lightweight, and luxurious",
    },
    {
      id: 5,
      label: "Leather/Faux Leather",
      subheader: "Durable hide or leather alternative",
    },
    {
      id: 6,
      label: "Synthetics",
      subheader:
        "Strong, flexible, and common in activewear like Polyster, Nylon, and Spandex",
    },
    {
      // TO DO: figure out how to handle other?
      id: 7,
      label: "Other",
      subheader: "Materials not listed above",
    },
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
                What material is this
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h1,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bold,
                  paddingBottom: 20,
                }}
              >
                item made of?
              </ThemedText>
            </View>
            <View
              className="materialOptionsView"
              style={{
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                paddingBottom: 20,
                width: "100%",
              }}
            >
              <View style={styles.materialOptionsGrid}>
                {materialOptions.map((option) => {
                  const isSelected = material === option.id;

                  return (
                    <Pressable
                      onPress={() => {
                        if (isSelected) {
                          setMaterial("");
                        } else {
                          setMaterial(option.id);
                        }
                      }}
                      key={option.id}
                      style={[
                        isSelected && styles.selectedMaterialOptions,
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
                          fontFamily: theme.fonts.bold,
                        }}
                      >
                        {option.label}
                      </ThemedText>
                      <ThemedText style={[styles.optionSubheader]}>
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
          onPress={() => setPage(4)}
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
        {material && (
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: "35%",
            }}
            onPress={() => setPage(6)}
          >
            <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = {
  materialOptionsGrid: {
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
  selectedMaterialOptions: {
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
