import { useState } from "react";
import {
    Image, Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import { ThemedText, ThemedView, TogglePreview } from "../../components";
import { theme } from "../../constants";
import { Ionicons } from "@expo/vector-icons";

const sanitize = (str) => {
    if (typeof str !== "string" || !str) return "";
    let cleanStr = str.replace(/_OR_/g, " / ");
    cleanStr = cleanStr.replace(/_/g, " ");
    return cleanStr.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export default function ReviewPage({
  setPage,
  uri,
  formality,
  pattern,
  color,
  itemType,
  material,
  fit,
  season,
  length,
  bulk,
  handleSubmit,
}) {
  const { isWide } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const buttonWidth = isWide ? 220 : "30%";

  // Temporary Debugging
  console.log("Review Page Props:", {
    uri,
    formality,
    pattern,
    color,
    itemType,
    material,
    fit,
    season,
    length,
    bulk,
  });

  //Converting for UX: pattern, formality, material, season, length
    const convertedItemType = sanitize(itemType);
    const convertedPattern = sanitize(pattern);
    const convertedFormality = sanitize(formality);
    const convertedMaterial = sanitize(material);
    const convertedSeason = sanitize(season);
    const convertedLength = sanitize(length);

    // Convert Sliders for UI Display
    const convertedFit = fit < 0.5 ? "Slim" : fit < 1.5 ? "Regular" : "Loose / Oversized";

  // Temporary Debugging for Converted Variables
  console.log(`Converted Fit: ${convertedFit}, Bulk: ${bulk}, 
    Converted Pattern: ${convertedPattern}, Converted Formality: ${convertedFormality}, Converted Material: ${convertedMaterial}, 
    Converted Season: ${convertedSeason}, Converted Length: ${convertedLength}`);

  return (
    <ThemedView gradient={true} style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isWide && styles.scrollContentWide,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.contentContainer]}>
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
                  alignText: "flex-start",
                }}
              >
                Review Your Response
              </ThemedText>
              <View
                className="divider"
                style={{
                  height: 1,
                  backgroundColor: theme.colors.text,
                  width: "100%",
                  marginVertical: 12,
                }}
              />
            </View>
            <View className="responseContent" style={{ flexGrow: 1, gap: 20 }}>
              {uri && (
                <View
                  style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 10,
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingHorizontal: 10,
                    flexDirection: "column",
                  }}
                >
                  <View
                    className="editContainer"
                    style={{
                      flexGrow: 1,
                      zIndex: 10,
                      alignItems: "flex-end",
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(1)}
                    />
                  </View>
                  <Image
                    source={{ uri }}
                    contentFit="cover"
                    style={{
                      width: "100%",
                      aspectRatio: 1,
                      borderRadius: 10,
                      paddingBottom: 20,
                    }}
                    onError={() => setImageFailed(true)}
                  />
                </View>
              )}
              {!uri && (
                <View
                  style={[
                    styles.responseContainer,
                    {
                      alignItems: "center",
                      backgroundColor: theme.colors.card,
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View
                    className="response"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      width: "70%",
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: theme.sizes.h3,
                        color: theme.colors.text,
                        fontFamily: theme.fonts.regular,
                      }}
                    >
                      No image uploaded
                    </ThemedText>
                  </View>
                  <View
                    className="editContainer"
                    style={{ flexGrow: 1, alignItems: "flex-end" }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(1)}
                    />
                  </View>
                </View>
              )}
              <View
                style={[
                  styles.responseContainer,
                  {
                    backgroundColor: theme.colors.card,
                  },
                ]}
              >
                <View
                  className="response"
                  style={{
                    alignItems: "flex-start",
                    flexDirection: "column",
                    width: "70%",
                  }}
                >
                  <ThemedText
                    style={[
                      styles.titleText,
                      {
                        fontFamily: theme.fonts.bold,
                        fontSize: theme.sizes.h3,
                      },
                    ]}
                  >
                    Item Type:
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.answerText,
                      {
                        fontFamily: theme.fonts.regular,
                        fontSize: theme.sizes.text,
                      },
                    ]}
                  >
                    {itemType}
                  </ThemedText>
                </View>
                <View
                  className="editContainer"
                  style={{ flexGrow: 1, alignItems: "flex-end" }}
                >
                  <Ionicons
                    name="create"
                    size={20}
                    color={theme.colors.text}
                    onPress={() => setPage(2)}
                  />
                </View>
              </View>
              <View
                style={[
                  styles.responseContainer,
                  {
                    backgroundColor: theme.colors.card,
                  },
                ]}
              >
                <View
                  className="response"
                  style={{
                    alignItems: "flex-start",
                    flexDirection: "column",
                    width: "70%",
                  }}
                >
                  <ThemedText
                    style={[
                      styles.titleText,
                      {
                        fontFamily: theme.fonts.bold,
                        fontSize: theme.sizes.h3,
                      },
                    ]}
                  >
                    Pattern:
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.answerText,
                      {
                        fontFamily: theme.fonts.regular,
                        fontSize: theme.sizes.text,
                      },
                    ]}
                  >
                    {convertedPattern}
                  </ThemedText>
                </View>
                {!color && (
                  <View
                    className="editContainer"
                    style={{ flexGrow: 1, alignItems: "flex-end" }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(3)}
                    />
                  </View>
                )}
              </View>
              {color && (
                <View
                  style={[
                    styles.responseContainer,
                    {
                      backgroundColor: theme.colors.card,
                    },
                  ]}
                >
                  <View
                    className="response"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      width: "70%",
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.titleText,
                        {
                          fontFamily: theme.fonts.bold,
                          fontSize: theme.sizes.h3,
                        },
                      ]}
                    >
                      Color:
                    </ThemedText>
                    <View
                      className="colorContainer"
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        className="colorPreview"
                        style={{
                          backgroundColor: color,
                          width: 30,
                          height: 30,
                          borderRadius: 25,
                          padding: 0,
                        }}
                      ></View>
                      <ThemedText
                        style={{
                          fontFamily: theme.fonts.regular,
                          fontSize: theme.sizes.text,
                          margin: 0,
                        }}
                      >
                        {color}
                      </ThemedText>
                    </View>
                  </View>
                  <View
                    className="editContainer"
                    style={{ flexGrow: 1, alignItems: "flex-end" }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(2)}
                    />
                  </View>
                </View>
              )}
              <View
                style={[
                  styles.responseContainer,
                  {
                    backgroundColor: theme.colors.card,
                  },
                ]}
              >
                <View
                  className="response"
                  style={{
                    alignItems: "flex-start",
                    flexDirection: "column",
                    width: "70%",
                  }}
                >
                  <ThemedText
                    style={[
                      styles.titleText,
                      {
                        fontFamily: theme.fonts.bold,
                        fontSize: theme.sizes.h3,
                      },
                    ]}
                  >
                    Formality:
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.answerText,
                      {
                        fontFamily: theme.fonts.regular,
                        fontSize: theme.sizes.text,
                      },
                    ]}
                  >
                    {convertedFormality}
                  </ThemedText>
                </View>
                <View
                  className="editContainer"
                  style={{ flexGrow: 1, alignItems: "flex-end" }}
                >
                  <Ionicons
                    name="create"
                    size={20}
                    color={theme.colors.text}
                    onPress={() => setPage(4)}
                  />
                </View>
              </View>
              <View
                style={[
                  styles.responseContainer,
                  {
                    backgroundColor: theme.colors.card,
                  },
                ]}
              >
                <View
                  className="response"
                  style={{
                    alignItems: "flex-start",
                    flexDirection: "column",
                    width: "70%",
                  }}
                >
                  <ThemedText
                    style={[
                      styles.titleText,
                      {
                        fontFamily: theme.fonts.bold,
                        fontSize: theme.sizes.h3,
                      },
                    ]}
                  >
                    Material:
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.answerText,
                      {
                        fontFamily: theme.fonts.regular,
                        fontSize: theme.sizes.text,
                      },
                    ]}
                  >
                    {convertedMaterial}
                  </ThemedText>
                </View>
                <View
                  className="editContainer"
                  style={{ flexGrow: 1, alignItems: "flex-end" }}
                >
                  <Ionicons
                    name="create"
                    size={20}
                    color={theme.colors.text}
                    onPress={() => setPage(5)}
                  />
                </View>
              </View>
              <View
                style={[
                  styles.responseContainer,
                  {
                    backgroundColor: theme.colors.card,
                  },
                ]}
              >
                <View
                  className="response"
                  style={{
                    alignItems: "flex-start",
                    flexDirection: "column",
                    width: "70%",
                  }}
                >
                  <ThemedText
                    style={[
                      styles.titleText,
                      {
                        fontFamily: theme.fonts.bold,
                        fontSize: theme.sizes.h3,
                      },
                    ]}
                  >
                    Fit:
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.answerText,
                      {
                        fontFamily: theme.fonts.regular,
                        fontSize: theme.sizes.text,
                      },
                    ]}
                  >
                    {convertedFit}
                  </ThemedText>
                </View>
                <View
                  className="editContainer"
                  style={{ flexGrow: 1, alignItems: "flex-end" }}
                >
                  <Ionicons
                    name="create"
                    size={20}
                    color={theme.colors.text}
                    onPress={() => setPage(6)}
                  />
                </View>
              </View>
              {/* OPTIONAL PARAMETERS */}
              {season ? (
                <View
                  style={[
                    styles.responseContainer,
                    {
                      backgroundColor: theme.colors.card,
                    },
                  ]}
                >
                  <View
                    className="response"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      width: "70%",
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.titleText,
                        {
                          fontFamily: theme.fonts.bold,
                          fontSize: theme.sizes.h3,
                        },
                      ]}
                    >
                      Season:
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.answerText,
                        {
                          fontFamily: theme.fonts.regular,
                          fontSize: theme.sizes.text,
                        },
                      ]}
                    >
                      {convertedSeason}
                    </ThemedText>
                  </View>
                  <View
                    className="editContainer"
                    style={{ flexGrow: 1, alignItems: "flex-end" }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(7)}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.responseContainer,
                    {
                      alignItems: "center",
                      backgroundColor: theme.colors.card,
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View
                    className="response"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      width: "70%",
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: theme.sizes.h3,
                        color: theme.colors.text,
                        fontFamily: theme.fonts.regular,
                      }}
                    >
                      Season not specified
                    </ThemedText>
                  </View>
                  <View
                    className="editContainer"
                    style={{ flexGrow: 1, alignItems: "flex-end" }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(7)}
                    />
                  </View>
                </View>
              )}
              {length ? (
                <View
                  style={[
                    styles.responseContainer,
                    {
                      backgroundColor: theme.colors.card,
                    },
                  ]}
                >
                  <View
                    className="response"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      width: "70%",
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.titleText,
                        {
                          fontFamily: theme.fonts.bold,
                          fontSize: theme.sizes.h3,
                        },
                      ]}
                    >
                      Length:
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.answerText,
                        {
                          fontFamily: theme.fonts.regular,
                          fontSize: theme.sizes.text,
                        },
                      ]}
                    >
                      {convertedLength}
                    </ThemedText>
                  </View>
                  <View
                    className="editContainer"
                    style={{ flexGrow: 1, alignItems: "flex-end" }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(8)}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.responseContainer,
                    {
                      alignItems: "center",
                      backgroundColor: theme.colors.card,
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View
                    className="response"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      width: "70%",
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: theme.sizes.h3,
                        color: theme.colors.text,
                        fontFamily: theme.fonts.regular,
                      }}
                    >
                      Length not specified
                    </ThemedText>
                  </View>
                  <View
                    className="editContainer"
                    style={{ flexGrow: 1, alignItems: "flex-end" }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(8)}
                    />
                  </View>
                </View>
              )}
              {bulk ? (
                <View
                  style={[
                    styles.responseContainer,
                    {
                      backgroundColor: theme.colors.card,
                    },
                  ]}
                >
                  <View
                    className="response"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      width: "70%",
                    }}
                  >
                    <ThemedText
                      style={[
                        styles.titleText,
                        {
                          fontFamily: theme.fonts.bold,
                          fontSize: theme.sizes.h3,
                        },
                      ]}
                    >
                      Bulk:
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.answerText,
                        {
                          fontFamily: theme.fonts.regular,
                          fontSize: theme.sizes.text,
                        },
                      ]}
                    >
                      {bulk}
                    </ThemedText>
                  </View>
                  <View
                    className="editContainer"
                    style={{ flexGrow: 1, alignItems: "flex-end" }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(2)}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.responseContainer,
                    {
                      alignItems: "center",
                      backgroundColor: theme.colors.card,
                      justifyContent: "center",
                    },
                  ]}
                >
                  <View
                    className="response"
                    style={{
                      alignItems: "flex-start",
                      flexDirection: "column",
                      width: "70%",
                    }}
                  >
                    <ThemedText
                      style={{
                        fontSize: theme.sizes.h3,
                        color: theme.colors.text,
                        fontFamily: theme.fonts.regular,
                      }}
                    >
                      Bulk not specified
                    </ThemedText>
                  </View>
                  <View
                    className="editContainer"
                    style={{ flexGrow: 1, alignItems: "flex-end" }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                      onPress={() => setPage(9)}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <Pressable
          onPress={() => setPage(9)}
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
          onPress={() => handleSubmit()}
        >
          <ThemedText style={{ textAlign: "center" }}>Submit</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = {
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
    alignItems: "flex-start",
    paddingBottom: 20,
    zIndex: 1,
  },
  textBlockNoImage: {
    marginTop: 8,
  },
  textBlockWide: {
    paddingHorizontal: 0,
  },
  responseContainer: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 30,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
  },
  titleText: {},
  answerText: {
    alignSelf: "flex-start",
  },
};
