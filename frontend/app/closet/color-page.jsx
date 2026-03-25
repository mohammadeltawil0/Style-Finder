import {
  ActivityIndicator,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText, ThemedView, TogglePreview } from "../../components";
import ColorPicker from 'react-native-color-picker-wheel';
import { useEffect, useState } from "react";
import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Animated: `useNativeDriver`']);

const getContrastColor = (hex) => {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? '#000000' : '#FFFFFF';
};

export default function ColorPage({ setPage, color, setColor, pattern, setPattern, uri, isSolid, setIsSolid }) {
  const [tempColor, setTempColor] = useState(color || '#74512D');
  const [isReady, setIsReady] = useState(false);

  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const buttonWidth = isWide ? 220 : "30%";

  const patternOptions = [
    {
      id: "solid",
      label: "Solid / None",
      emoji: "🎨",
      subheader: "Unicolor with no visible print",
    },
    {
      id: "striped",
      label: "Striped",
      emoji: "🦓",
      subheader: "Vertical or horizontal stripes",
    },
    {
      id: "plaid-flannel",
      label: "Plaid / Flannel",
      emoji: "🧣",
      subheader: "Tartan or checkered pattern",
    },
    {
      id: "floral",
      label: "Floral",
      emoji: "🌸",
      subheader: "Nature-inspired flower or leaf prints",
    },
    {
      id: "graphic",
      label: "Graphic",
      emoji: "🖼️",
      subheader: "Logos, large text, or statement prints",
    },
    {
      id: "geometric-abstract",
      label: "Geometric / Abstract",
      emoji: "🔷",
      subheader: "Polka dots or repeating abstract shapes",
    },
  ];

  useEffect(() => {
    let isMounted = true;
    InteractionManager.runAfterInteractions(() => {
      // A 150ms delay is invisible to humans but huge for a CPU
      if (isMounted) setIsReady(true);
    });
    return () => { isMounted = false; };
  }, []);

  if (!isReady) {
    return (
      <ThemedView style={styles.page}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.text} />
          <ThemedText style={{ marginTop: 10 }}>Loading Picker...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView gradient={true} style={styles.page}>
      <ScrollView
        style={styles.scrollView}
        // scrollEnabled={!isSolid}
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

          <View style={styles.mainContent}>
            {pattern === "solid" && isSolid && (
              <>
                <View style={styles.textContainer}>
                  <ThemedText style={{ fontSize: theme.sizes.h1, color: theme.colors.text, fontFamily: theme.fonts.bold, }}>
                    {"What color does \n this item have?"}
                  </ThemedText>
                  <ThemedText style={{ fontSize: theme.sizes.text, color: theme.colors.text, marginTop: 8, }}>
                    {"Use the color wheel to select the closest match."}
                  </ThemedText>
                </View>

                <View>
                  <Pressable
                    onPress={() => {
                      setPattern("");
                      setColor("");
                      setIsSolid(false);
                    }}
                  >
                    <ThemedText style={{ backgroundColor: theme.colors.card, textAlign: "center", fontSize: theme.sizes.h3, marginTop: 20, color: theme.colors.text, padding: 10, borderRadius: 10, paddingHorizontal: 20, }}>
                      Change Pattern
                    </ThemedText>
                  </Pressable>
                </View>

                <View style={styles.pickerSection}>
                  <View style={styles.wheelContainer}>

                    <View style={{ opacity: isReady ? 1 : 0, width: '100%', height: '100%' }}>
                      <ColorPicker
                        color={tempColor}
                        onColorChange={(c) => setTempColor(c)}
                        onColorChangeComplete={(c) => setColor(c)}
                        style={{ width: "100%" }}
                      />
                    </View>

                    {!isReady && (
                      <View style={styles.absoluteLoader}>
                        <ActivityIndicator size="large" color={theme.colors.text} />
                        <ThemedText style={styles.loadingText}>Readying Wheel...</ThemedText>
                      </View>
                    )}
                  </View>

                  <View style={[styles.previewBadge, { backgroundColor: tempColor }]}>
                    <ThemedText style={{ color: getContrastColor(tempColor), fontWeight: 'bold' }}>
                      {tempColor.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
              </>
            )}
          </View>
          
          {/* Pattern Options */}
          {!isSolid && (
            <>
              <View style={styles.textContainer}>
                <ThemedText style={{ fontSize: theme.sizes.h1, color: theme.colors.text, fontFamily: theme.fonts.bold, }}>
                  {"What pattern does \n this item have?"}
                </ThemedText>
              </View>
              <View
                className="patternOptionsView"
                style={{ alignItems: "center", justifyContent: "center", gap: 12, paddingBottom: 20, width: "100%" }}
              >
                <View style={styles.patternOptionsGrid}>
                  {patternOptions.map((option) => {
                    const isSelected = pattern === option.id;
                    return (
                      <Pressable
                        onPress={() => {
                          if (isSelected) {
                            setPattern("");
                            setColor("");
                            setIsSolid(false);
                          } else {
                            setPattern(option.id);
                            setIsSolid(false);
                            if (option.id !== "solid") {
                              setColor("");
                            }
                          }
                        }}
                        key={option.id}
                        style={[
                          isSelected && styles.selectedPatternOptionButton,
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
            </>
          )}
        </View>
      </ScrollView>
      <View style={styles.navigationButtons}>
        <Pressable
          onPress={() => setPage(2)}
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            padding: 10,
            width: buttonWidth,
          }}
        >
          <ThemedText style={{ textAlign: "center" }}>Back</ThemedText>
        </Pressable>
        {((color && pattern === "solid") || (!color && pattern !== "solid" && pattern.length > 0)) && (
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: buttonWidth,
            }}
            onPress={() => setPage(4)}
          >
            <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
          </Pressable>
        )}
        {pattern === "solid" && color === "" && (
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: buttonWidth,
            }}
            onPress={() => setIsSolid(true)}
          >
            <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView >
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  textContainer: {
    marginBottom: 20,
  },
  mainContent: {
    justifyContent: "center",
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  choiceButtonsContainer: {
    width: "100%",
    maxWidth: 520,
    gap: 20,
  },
  choiceButton: {
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: "100%",
  },
  pickerSection: {
    alignItems: 'center',
    width: '100%',
    minHeight: 380,
  },
  wheelContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  wheelPlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0,0,0,0.03)', // Subtle "ghost" circle
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 12,
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewBadge: {
    marginTop: 20,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  togglePreviewContainer: {
    position: 'relative',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  absoluteLoader: {
    position: 'absolute', // Sits on top of the hidden picker
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  patternOptionsGrid: {
    gap: 12,
    justifyContent: "center",
    width: "100%",
  },
  selectedPatternOptionButton: {
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
});