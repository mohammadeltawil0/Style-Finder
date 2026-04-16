import { useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { Camera, ThemedText, ThemedView } from "../../components";
import { theme } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import EditModal from "./edit-modal";
import ColorPicker from "react-native-color-picker-wheel";
import Toast from "react-native-toast-message";
import {
  BULK_OPTIONS,
  CATEGORY_OPTIONS,
  FIT_OPTIONS,
  FORMALITY_OPTIONS,
  LENGTH_OPTIONS,
  MATERIAL_OPTIONS,
  PATTERN_OPTIONS,
  SEASON_OPTIONS,
} from "../../constants/options";

const DEFAULT_COLOR = "#74512D";
const HEX_COLOR_REGEX = /^#([0-9A-F]{6}|[0-9A-F]{8})$/i;

const normalizeColor = (value) => {
  if (typeof value !== "string") return DEFAULT_COLOR;
  return HEX_COLOR_REGEX.test(value) ? value : DEFAULT_COLOR;
};

const getContrastColor = (hexColor) => {
  if (!hexColor || typeof hexColor !== "string" || !hexColor.startsWith("#") || hexColor.length < 7) {
    return "#FFFFFF";
  }

  const r = parseInt(hexColor.substring(1, 3), 16);
  const g = parseInt(hexColor.substring(3, 5), 16);
  const b = parseInt(hexColor.substring(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 125 ? "#000000" : "#FFFFFF";
};

const sanitize = (type, str) => {
  if (typeof str !== "string") return "";

  const titleCaseIfAllCaps = (value) => {
    if (!value) return value;
    const hasLetters = /[a-z]/i.test(value);
    if (!hasLetters || value !== value.toUpperCase()) return value;

    const lowered = value.toLowerCase();
    return lowered.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  //pattern
  if (type === "pattern") {
    if (str === "GEOMETRIC_OR_ABSTRACT") {
      return "Geometric/Abstract";
    } else if (str === "PLAID_OR_FLANNEL") {
      return "Plaid/Flannel";
    } else {
      //active/sport and work/smart
      return titleCaseIfAllCaps(str.replace(/[_-]/g, " "));
    }
  }

  //formality
  if (type === "formality") {
    if (str === "PARTY_OR_NIGHT_OUT") {
      return "Party/Night Out";
    } else if (str === "ACTIVE_OR_SPORT") {
      return "Active/Sport";
    } else if (str === "WORK_OR_SMART") {
      return "Work/Smart";
    } else {
      //active/sport and work/smart
      return titleCaseIfAllCaps(str.replace(/[_-]/g, " "));
    }
  }

  //material
  if (type === "material") {
    if (str === "Leather-Faux-Leather") {
      return "Leather/Faux Leather";
    } else {
      return titleCaseIfAllCaps(str.replace(/[_-]/g, " "));
    }
  }

  if (type === "length") {
    if (str === "KNEE_LENGTH_OR_BERMUDA") {
      return "Knee Length/Bermuda";
    } else if (str === "MAXI_OR_FULL_LENGTH") {
      return "Maxi/Full Length";
    } else if (str === "MIDI_OR_CAPRI") {
      return "Midi/Capri";
    } else {
      return titleCaseIfAllCaps(str.replace(/[_-]/g, " "));
    }
  }

  // works for
  return titleCaseIfAllCaps(str.replace(/[_-]/g, " "));
};

export default function ReviewPage({
  goBack,
  setUri,
  setItemType,
  setPattern,
  setColor,
  setFormality,
  setMaterial,
  setFit,
  setSeason,
  setLength,
  setBulk,
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
  isPending
}) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const isWeb = Platform.OS === "web";
  const buttonWidth = isWide ? 220 : "30%";
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isPatternModalVisible, setIsPatternModalVisible] = useState(false);
  const [isFormalityModalVisible, setIsFormalityModalVisible] = useState(false);
  const [isMaterialModalVisible, setIsMaterialModalVisible] = useState(false);
  const [isFitModalVisible, setIsFitModalVisible] = useState(false);
  const [isSeasonModalVisible, setIsSeasonModalVisible] = useState(false);
  const [isLengthModalVisible, setIsLengthModalVisible] = useState(false);
  const [isBulkModalVisible, setIsBulkModalVisible] = useState(false);
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [draftImageUri, setDraftImageUri] = useState(uri ?? null);
  const [tempColor, setTempColor] = useState(normalizeColor(color));

  //Converting for UX: pattern, formality, material, season, length
  const convertedPattern = pattern ? sanitize("pattern", pattern) : null;
  const convertedFormality = formality
    ? sanitize("formality", formality)
    : null;
  const convertedItemType = itemType ? sanitize("itemType", itemType) : null;
  // const convertedMaterial = material ? sanitize("material", material) : null;
  const materialMap = {
    1: "Cotton",
    2: "Linen/Hemp",
    3: "Wool/Fleece",
    4: "Silk/Satin",
    5: "Leather/Faux Leather",
    6: "Synthetics",
    7: "Other"
  };
  const convertedMaterial = material ? materialMap[material] : null;
  const convertedSeason = season ? sanitize("season", season) : null;
  const convertedLength = length ? sanitize("length", length) : null;

  // Convert enum/int fit states to actual categories for review page display
  const convertedFit =
    fit < 0.5
      ? "Skinny"
      : fit < 1.5
        ? "Regular"
        : "Oversized";

  const convertedBulk = bulk === 0 ? "Thin" : bulk === 1 ? "Regular" : "Thick";

  const getOptionLabel = (options, value) => {
    if (value === null || value === undefined || value === "") return "Not specified";
    return options.find((option) => option.value === value)?.label ?? String(value);
  };

  const fitToLabel = (value) => (value < 0.5 ? "SLIM" : value < 1.5 ? "REGULAR" : "LOOSE");
  const fitLabelToValue = (value) => {
    if (value === "SLIM") return 0;
    if (value === "REGULAR") return 1;
    return 2;
  };

  const openEditModal = (field) => {
    if (field === 1) {
      setDraftImageUri(uri ?? null);
      setIsImageModalVisible(true);
      return;
    }
    if (field === 2) setIsCategoryModalVisible(true);
    if (field === 3) setIsPatternModalVisible(true);
    if (field === 4) setIsFormalityModalVisible(true);
    if (field === 5) setIsMaterialModalVisible(true);
    if (field === 6) setIsFitModalVisible(true);
    if (field === 7) setIsSeasonModalVisible(true);
    if (field === 8) setIsLengthModalVisible(true);
    if (field === 9) setIsBulkModalVisible(true);
  };

  const showUpdateSuccess = (label) => {
    Toast.show({
      type: "success",
      text1: `Item updated`,
      text2: 'Your changes were saved.'
    });
  };

  const showUpdateError = (label) => {
    Toast.show({
      type: "error",
      text1: `Error updating item`,
      text2: `Could not update ${label.toLowerCase()}`,
    });
  };

  const applyLocalUpdate = (label, updater) => {
    try {
      updater();
      showUpdateSuccess(label);
    } catch {
      showUpdateError(label);
    }
  };

  const handleImageChange = (nextUri) => {
    setDraftImageUri(nextUri ?? null);
  };

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
              {uri && !imageFailed && (
                <Pressable
                  style={{
                    backgroundColor: theme.colors.card,
                    borderRadius: 10,
                    flexDirection: "column",
                  }}
                  onPress={() => openEditModal(1)}
                >
                  <Image
                    source={{ uri }}
                    resizeMode="cover"
                    style={{
                      width: "100%",
                      aspectRatio: 1,
                      borderRadius: 10,
                    }}
                    onError={() => setImageFailed(true)}
                  />
                  <View
                    style={{
                      position: "absolute",
                      right: 6,
                      top: 6,
                      borderRadius: 12,
                      padding: 4,
                      justifyContent: "center",
                      backgroundColor: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <Ionicons
                      name="create"
                      size={20}
                      color={theme.colors.text}
                    />
                  </View>
                </Pressable>
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
                      onPress={() => openEditModal(1)}
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
                    {convertedItemType}
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
                    onPress={() => openEditModal(2)}
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
                <View
                  className="editContainer"
                  style={{ flexGrow: 1, alignItems: "flex-end" }}
                >
                  <Ionicons
                    name="create"
                    size={20}
                    color={theme.colors.text}
                    onPress={() => openEditModal(3)}
                  />
                </View>
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
                          backgroundColor: normalizeColor(color),
                          width: 30,
                          height: 30,
                          borderRadius: 25,
                          padding: 0,
                        }}
                      ></View>
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
                      onPress={() => {
                        setTempColor(normalizeColor(color));
                        setIsColorModalVisible(true);
                      }}
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
                    onPress={() => openEditModal(4)}
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
                    onPress={() => openEditModal(5)}
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
                    onPress={() => openEditModal(6)}
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
                      onPress={() => openEditModal(7)}
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
                      onPress={() => openEditModal(7)}
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
                      onPress={() => openEditModal(8)}
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
                      onPress={() => openEditModal(8)}
                    />
                  </View>
                </View>
              )}
              {bulk !== null && bulk !== undefined ? (
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
                      {convertedBulk}
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
                      onPress={() => openEditModal(9)}
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
                      onPress={() => openEditModal(9)}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isImageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={[styles.imageModalCard, { backgroundColor: theme.colors.lightBrown }]}>
            <View style={styles.imageModalHeader}>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                }}
              >
                Edit Image
              </ThemedText>
            </View>

            <View style={styles.imageModalBody}>
              <Camera
                setUri={handleImageChange}
                uri={draftImageUri}
                setPage={() => setIsImageModalVisible(false)}
                hideNextButton={true}
              />
            </View>
            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => {
                  setDraftImageUri(uri ?? null);
                  setIsImageModalVisible(false);
                }}
                disabled={isPending}
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: theme.colors.card,
                    opacity: isPending ? 0.7 : 1,
                  },
                ]}
              >
                <ThemedText style={{ fontFamily: theme.fonts.bold }}>
                  Cancel
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  const hasChanged = draftImageUri !== uri;
                  if (hasChanged) {
                    setUri(draftImageUri ?? null);
                    setImageFailed(false);
                    Toast.show({
                      type: "success",
                      text1: "Image updated",
                      text2: "Your photo was updated.",
                    });
                  }
                  setIsImageModalVisible(false);
                }}
                disabled={isPending}
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: theme.colors.tabIconSelected,
                    opacity: isPending ? 0.7 : 1,
                  },
                ]}
              >
                <ThemedText style={{ fontFamily: theme.fonts.bold }}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isColorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsColorModalVisible(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: theme.colors.card }]}>
            <ThemedText
              style={{
                fontSize: theme.sizes.h2,
                fontFamily: theme.fonts.bold,
                marginBottom: 12,
              }}
            >
              Edit Color
            </ThemedText>

            <View style={styles.colorWheelWrap}>
              <ColorPicker
                color={normalizeColor(tempColor)}
                onColorChange={(nextColor) => {
                  if (typeof nextColor === "string") {
                    setTempColor(nextColor);
                  }
                }}
                onColorChangeComplete={(nextColor) => {
                  if (typeof nextColor === "string") {
                    setTempColor(nextColor);
                  }
                }}
                style={{ width: "100%" }}
              />
            </View>

            <View style={[styles.colorPreviewBadge, { backgroundColor: normalizeColor(tempColor) }]} />
            <View style={styles.confirmActions}>
              <Pressable
                style={[styles.confirmBtn, { backgroundColor: theme.colors.lightBrown }]}
                onPress={() => {
                  setTempColor(normalizeColor(color));
                  setIsColorModalVisible(false);
                }}
                disabled={isPending}
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.confirmBtn,
                  {
                    backgroundColor: theme.colors.tabIconSelected,
                    opacity: isPending ? 0.7 : 1,
                  },
                ]}
                onPress={() => {
                  applyLocalUpdate("Color", () => {
                    setColor(normalizeColor(tempColor));
                    setIsColorModalVisible(false);
                  });
                }}
                disabled={isPending}
              >
                <ThemedText style={{ color: theme.colors.text }}>Save</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <EditModal
        modalVisible={isCategoryModalVisible}
        setModalVisible={setIsCategoryModalVisible}
        value={itemType}
        onSelect={(nextValue) =>
          applyLocalUpdate("Category", () => {
            setItemType(nextValue);
          })
        }
        options={CATEGORY_OPTIONS}
        title="Edit Category"
        isSaving={isPending}
      />

      <EditModal
        modalVisible={isPatternModalVisible}
        setModalVisible={setIsPatternModalVisible}
        value={pattern}
        onSelect={(nextValue) => {
          applyLocalUpdate("Pattern", () => {
            setPattern(nextValue);
            if (nextValue !== "SOLID") {
              setColor("");
              return;
            }

            const nextColor = color || DEFAULT_COLOR;
            setColor(nextColor);
            setTempColor(nextColor);
            setIsColorModalVisible(true);
          });
        }}
        options={PATTERN_OPTIONS}
        title="Edit Pattern"
        isSaving={isPending}
      />

      <EditModal
        modalVisible={isFormalityModalVisible}
        setModalVisible={setIsFormalityModalVisible}
        value={formality}
        onSelect={(nextValue) =>
          applyLocalUpdate("Formality", () => {
            setFormality(nextValue);
          })
        }
        options={FORMALITY_OPTIONS}
        title="Edit Formality"
        isSaving={isPending}
      />

      <EditModal
        modalVisible={isMaterialModalVisible}
        setModalVisible={setIsMaterialModalVisible}
        value={material}
        onSelect={(nextValue) =>
          applyLocalUpdate("Material", () => {
            setMaterial(nextValue);
          })
        }
        options={MATERIAL_OPTIONS}
        title="Edit Material"
        isSaving={isPending}
      />

      <EditModal
        modalVisible={isFitModalVisible}
        setModalVisible={setIsFitModalVisible}
        value={fitToLabel(fit ?? 1)}
        onSelect={(nextValue) =>
          applyLocalUpdate("Fit", () => {
            setFit(fitLabelToValue(nextValue));
          })
        }
        options={FIT_OPTIONS}
        title="Edit Fit"
        isSaving={isPending}
      />

      <EditModal
        modalVisible={isSeasonModalVisible}
        setModalVisible={setIsSeasonModalVisible}
        value={season}
        onSelect={(nextValue) =>
          applyLocalUpdate("Season", () => {
            setSeason(nextValue);
          })
        }
        options={SEASON_OPTIONS}
        title="Edit Season"
        isSaving={isPending}
      />

      <EditModal
        modalVisible={isLengthModalVisible}
        setModalVisible={setIsLengthModalVisible}
        value={length}
        onSelect={(nextValue) =>
          applyLocalUpdate("Length", () => {
            setLength(nextValue);
          })
        }
        options={LENGTH_OPTIONS}
        title="Edit Length"
        isSaving={isPending}
      />

      <EditModal
        modalVisible={isBulkModalVisible}
        setModalVisible={setIsBulkModalVisible}
        value={bulk}
        onSelect={(nextValue) =>
          applyLocalUpdate("Bulk", () => {
            setBulk(nextValue);
          })
        }
        options={BULK_OPTIONS}
        title="Edit Bulk"
        isSaving={isPending}
      />

      <View style={[styles.navigationButtons, isWeb && styles.navigationButtonsWeb]}>
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
        <Pressable
          onPress={handleSubmit}
          disabled={isPending}
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            padding: 10,
            width: buttonWidth,
          }}
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: "100%",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  confirmActions: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  colorWheelWrap: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  imageModalCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "90%",
    borderRadius: 12,
    overflow: "hidden",
    padding: 12,
  },
  imageModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  closeIconBtn: {
    borderRadius: 999,
    padding: 4,
  },
  imageModalBody: {
    width: "100%",
    height: 520,
  },
  answerText: {
    alignSelf: "flex-start",
  },
};









