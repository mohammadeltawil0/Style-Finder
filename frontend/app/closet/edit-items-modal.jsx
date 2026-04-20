import { ActivityIndicator, Image, Modal, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Camera, ThemedText } from "../../components";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "../../scripts/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import EditModal from "./edit-modal";
import Toast from "react-native-toast-message";
import * as FileSystem from "expo-file-system/legacy";
import ColorPicker from "react-native-color-picker-wheel";
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

const titleCaseFromEnum = (value) => {
    if (value === null || value === undefined || value === "") return "Not specified";

    const raw = String(value);
    const specialMap = {
        PLAID_OR_FLANNEL: "Plaid/Flannel",
        GEOMETRIC_OR_ABSTRACT: "Geometric/Abstract",
        PARTY_OR_NIGHT_OUT: "Party/Night Out",
        ACTIVE_OR_SPORT: "Active/Sport",
        WORK_OR_SMART: "Work/Smart",
        KNEE_LENGTH_OR_BERMUDA: "Knee Length/Bermuda",
        MAXI_OR_FULL_LENGTH: "Maxi/Full Length",
        MIDI_OR_CAPRI: "Midi/Capri",
        ALL_SEASONS: "All Seasons",
    };

    if (specialMap[raw]) return specialMap[raw];

    return raw
        .replace(/[_-]/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const MATERIAL_LABELS = {
    1: "Cotton",
    2: "Linen/Hemp",
    3: "Wool/Fleece",
    4: "Silk/Satin",
    5: "Leather/Faux Leather",
    6: "Synthetics",
    7: "Other",
};

const materialToLabel = (value) => {
    if (value === null || value === undefined || value === "") return "Not specified";
    if (typeof value === "number") return MATERIAL_LABELS[value] || "Not specified";

    const raw = String(value).trim();
    if (!raw) return "Not specified";

    const asNumber = Number(raw);
    if (!Number.isNaN(asNumber) && MATERIAL_LABELS[asNumber]) return MATERIAL_LABELS[asNumber];

    const upper = raw.toUpperCase();
    const enumMap = {
        COTTON: 1,
        LINEN_HEMP: 2,
        WOOL_FLEECE: 3,
        SILK_SATIN: 4,
        LEATHER_FAUX_LEATHER: 5,
        SYNTHETICS: 6,
        OTHER: 7,
    };

    if (enumMap[upper]) return MATERIAL_LABELS[enumMap[upper]];

    const key = raw.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
    const labelMap = {
        cotton: 1,
        "linen/hemp": 2,
        "linen hemp": 2,
        "wool/fleece": 3,
        "wool fleece": 3,
        "silk/satin": 4,
        "silk satin": 4,
        "leather/faux leather": 5,
        "leather faux leather": 5,
        synthetics: 6,
        other: 7,
    };

    return labelMap[key] ? MATERIAL_LABELS[labelMap[key]] : titleCaseFromEnum(raw);
};
export default function EditItemsModal({ item, setModalVisible }) {
// TO DO: edit item logic
    useEffect(() => {
        const t = Date.now();
        console.log('[EditItemsModal] mount at', new Date(t).toISOString());
        return () => {
            console.log('[EditItemsModal] unmount at', new Date().toISOString());
        };
    }, []);

    const [uri, setUri] = useState(null);
    const [category, setCategory] = useState("TOP");
    const [pattern, setPattern] = useState("SOLID");
    const [color, setColor] = useState("red");
    const [material, setMaterial] = useState("cotton");
    const [event, setEvent] = useState("casual");
    const [fit, setFit] = useState("regular");
    const [season, setSeason] = useState(null);
    const [length, setLength] = useState(null);
    const [bulk, setBulk] = useState(null);
    const [imageDataForSave, setImageDataForSave] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
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
    const [draftImageUri, setDraftImageUri] = useState(null);
    const [tempColor, setTempColor] = useState(DEFAULT_COLOR);

    const theme = useTheme();
    const queryClient = useQueryClient();

    const hasImageUrl = typeof uri === "string" && uri.trim().length > 0;

    const fitToSliderValue = (value) => {
        if (typeof value === "number") return value;
        if (value === "SLIM") return 0;
        if (value === "REGULAR") return 1;
        if (value === "LOOSE") return 2;
        if (value === "OVERSIZED") return 2;
        return 1;
    };

    const normalizeCategory = (value) => {
        if (!value) return "TOP";
        const map = {
            Top: "TOP",
            Bottom: "BOTTOM",
            Outerwear: "OUTERWEAR",
            "Full Body": "FULL_BODY"
        };
        return map[value] || value;
    };

    const normalizeEvent = (value) => {
        if (!value) return "CASUAL";
        const map = {
            casual: "CASUAL",
            "business-casual": "BUSINESS_CASUAL",
            formal: "FORMAL",
            active: "ACTIVE_OR_SPORT",
            "Active/Sport": "ACTIVE_OR_SPORT",
            "Work/Smart": "WORK_OR_SMART",
            "Party/Night Out": "PARTY_OR_NIGHT_OUT",
        };
        return map[value] || value;
    };

    const normalizeSeason = (value) => {
        if (!value) return null;
        const map = {
            Winter: "WINTER",
            Spring: "SPRING",
            Summer: "SUMMER",
            Fall: "FALL",
            "All Seasons": "ALL_SEASONS",
        };
        return map[value] || value;
    };

    const normalizeLength = (value) => {
        if (!value) return null;
        const map = {
            "knee-length": "KNEE_LENGTH_OR_BERMUDA",
            "midi-length": "MIDI_OR_CAPRI",
            shorts: "ABOVE_KNEE",
            cropped: "ABOVE_KNEE",
        };
        return map[value] || value;
    };

    const normalizePattern = (value) => {
        if (!value) return "SOLID";
        const map = {
            "solid-unicolor": "SOLID",
            striped: "STRIPED",
            checkered: "PLAID_OR_FLANNEL",
            patterned: "GEOMETRIC_OR_ABSTRACT",
            "tie-dye": "GRAPHIC",
            other: "OTHER",
            Solid: "SOLID",
            Striped: "STRIPED",
            Plaid: "PLAID_OR_FLANNEL",
            Floral: "FLORAL",
            Graphic: "GRAPHIC",
            Geometric: "GEOMETRIC_OR_ABSTRACT",
        };
        return map[value] || value;
    };

    const normalizeMaterial = (value) => {
        if (value === null || value === undefined || value === "") return null;
        if (typeof value === "number") return value;

        const asNumber = Number(value);
        if (!Number.isNaN(asNumber) && asNumber >= 1 && asNumber <= 7) return asNumber;

        const upper = String(value).toUpperCase();
        const enumMap = {
            COTTON: 1,
            LINEN_HEMP: 2,
            WOOL_FLEECE: 3,
            SILK_SATIN: 4,
            LEATHER_FAUX_LEATHER: 5,
            SYNTHETICS: 6,
            OTHER: 7,
        };
        if (enumMap[upper]) return enumMap[upper];

        const map = {
            cotton: 1,
            "linen/hemp": 2,
            "wool/fleece": 3,
            "silk/satin": 4,
            "leather/faux leather": 5,
            synthetics: 6,
            other: 7,
        };
        const key = String(value).toLowerCase();
        return map[key] || value;
    };

    const normalizeBulk = (value) => {
        if (value === null || value === undefined || value === "") return null;
        if (typeof value === "number") return value;
        const map = {
            Thin: 0,
            Regular: 1,
            Thick: 2,
        };
        return map[value] ?? value;
    };

    useEffect(() => {
        if (!item) return;

        setUri(item.imageUrl || item.uri || null);
        setDraftImageUri(item.imageUrl || item.uri || null);
        setImageDataForSave(item.imageUrl || item.uri || null);
        setCategory(normalizeCategory(item.type || item.category));
        setPattern(normalizePattern(item.pattern));
        setColor(item.color || null);
        setTempColor(item.color || DEFAULT_COLOR);
        setMaterial(normalizeMaterial(item.material));
        setEvent(normalizeEvent(item.formality || item.event));
        setFit(fitToSliderValue(item.fit));
        setSeason(normalizeSeason(item.seasonWear || item.season));
        setLength(normalizeLength(item.length));
        setBulk(normalizeBulk(item.bulk));
    }, [item]);

    let convertedFit = 0;

    fit >= 0 && fit < 0.5
        ? (convertedFit = 0)
        : fit >= 0.5 && fit < 1.5
            ? (convertedFit = 1)
            : (convertedFit = 2);

    const getOptionLabel = (options, value) => {
        if (value === null || value === undefined || value === "") return "Not specified";
        return options.find((option) => option.value === value)?.label || titleCaseFromEnum(value);
    };

    const deleteItemMutation = useMutation({
        mutationFn: async (itemId) => {
            await apiClient.delete(`/api/items/${itemId}`);
        },
        onSuccess: async () => {
            // Keep query keys aligned with ClosetScreen useQuery(['items', userId]).
            await queryClient.invalidateQueries({ queryKey: ["items"] });
            Toast.show({
                type: "success",
                text1: "Item deleted",
                text2: "The item was removed successfully.",
            });
            setIsDeleteModalVisible(false);
            setModalVisible(false);
        },
        onError: (error) => {
            console.error("Failed to delete item:", error);
            Toast.show({
                type: "error",
                text1: "Delete failed",
                text2: "We could not delete this item. Please try again.",
            });
        },
    });

    const updateItemMutation = useMutation({
        mutationFn: async (changes) => {
            const itemId = item?.itemId ?? item?.id;

            if (!itemId) {
                throw new Error("Missing item id for update.");
            }

            const payload = {
                userId: item?.userId,
                type: changes?.type ?? category,
                color: changes?.color ?? color,
                pattern: changes?.pattern ?? pattern,
                length: changes?.length ?? length,
                material: changes?.material ?? material,
                bulk: changes?.bulk ?? bulk,
                seasonWear: changes?.seasonWear ?? season,
                formality: changes?.formality ?? event,
                fit:
                    changes?.fit ??
                    (convertedFit === 0 ? "SLIM" : convertedFit === 1 ? "REGULAR" : "LOOSE"),
                imageUrl: changes?.imageUrl ?? imageDataForSave,
            };

            const response = await apiClient.put(`/api/items/${itemId}`, payload);
            return response.data;
        },
        onSuccess: async (updatedItem) => {
            if (updatedItem?.type) {
                setCategory(updatedItem.type);
            }
            if (updatedItem?.pattern) {
                setPattern(updatedItem.pattern);
            }
            if (updatedItem?.color !== undefined) {
                setColor(updatedItem.color);
                setTempColor(updatedItem.color || DEFAULT_COLOR);
            }
            if (updatedItem?.formality) {
                setEvent(updatedItem.formality);
            }
            if (updatedItem?.material !== null && updatedItem?.material !== undefined) {
                setMaterial(normalizeMaterial(updatedItem.material));
            }
            if (updatedItem?.fit) {
                setFit(fitToSliderValue(updatedItem.fit));
            }
            if (updatedItem?.seasonWear || updatedItem?.season) {
                setSeason(normalizeSeason(updatedItem.seasonWear || updatedItem.season));
            }
            if (updatedItem?.length) {
                setLength(normalizeLength(updatedItem.length));
            }
            if (updatedItem?.bulk !== null && updatedItem?.bulk !== undefined) {
                setBulk(normalizeBulk(updatedItem.bulk));
            }
            if (updatedItem?.imageUrl) {
                setImageDataForSave(updatedItem.imageUrl);
            }
            await queryClient.invalidateQueries({ queryKey: ["items"] });
            Toast.show({
                type: "success",
                text1: "Item updated",
                text2: "Your changes were saved.",
            });
        },
        onError: (error) => {
            console.error("Failed to update item category:", error);
            Toast.show({
                type: "error",
                text1: "Update failed",
                text2: "We could not save your changes. Please try again.",
            });
        },
    });

    const handleDeleteItem = () => {
        const resolvedItemId = itemId ?? item?.itemId ?? item?.id;
        if (!resolvedItemId || deleteItemMutation.isPending) {
            console.error("Delete blocked: missing item id", item);
            return;
        }

        deleteItemMutation.mutate(resolvedItemId);
    };

    const convertToBase64 = async (localUri) => {
        const base64 = await FileSystem.readAsStringAsync(localUri, {
            encoding: "base64",
        });
        return `data:image/jpeg;base64,${base64}`;
    };

    const openImageEditor = () => {
        setDraftImageUri(uri ?? null);
        setIsImageModalVisible(true);
    };

    const handleImageChange = (nextUri) => {
        setDraftImageUri(nextUri ?? null);
    };

    const saveImageChanges = async () => {
        if (updateItemMutation.isPending) return;

        const hasChanged = draftImageUri !== uri;
        if (!hasChanged) {
            setIsImageModalVisible(false);
            return;
        }

        try {
            const imageData = draftImageUri ? await convertToBase64(draftImageUri) : null;

            setUri(draftImageUri ?? null);
            setImageDataForSave(imageData);
            updateItemMutation.mutate({ imageUrl: imageData });
            setIsImageModalVisible(false);
        } catch (error) {
            console.error("Failed to process selected image:", error);
            Toast.show({
                type: "error",
                text1: "Image update failed",
                text2: "Could not process this image. Please try another one.",
            });
        }
    };

    const displayValue = (value, type = null) => {
        if (value === null || value === undefined || value === "") return "Not specified";
        if (type === "category") return getOptionLabel(CATEGORY_OPTIONS, value);
        if (type === "pattern") return getOptionLabel(PATTERN_OPTIONS, value);
        if (type === "formality") return titleCaseFromEnum(value);
        if (type === "material") {
            return materialToLabel(value);
        }
        if (type === "bulk") {
            const bulkMap = {
                0: "Thin",
                1: "Regular",
                2: "Thick",
            };
            return typeof value === "number" ? bulkMap[value] || "Not specified" : String(value);
        }
        if (type === "length") return titleCaseFromEnum(value);
        if (type === "season") return titleCaseFromEnum(value);
        return titleCaseFromEnum(value);
    };

    return (
        <>
            <View
                style={{ backgroundColor: theme.colors.background, paddingBottom: 30 }}
            >
                <ScrollView
                    contentContainerStyle={{
                        paddingHorizontal: 30,
                        flexGrow: 1,
                        alignItems: "stretch",
                        width: "100%",
                    }}
                >
                    <View className="chevronView" style={styles.chevronView}>
                        <Pressable
                            onPress={() => setModalVisible(false)}
                            style={[styles.topActionButton,
                                // { backgroundColor: theme.colors.card }
                            ]}
                        >
                            <Entypo name="chevron-left" size={30} color="black" />
                        </Pressable>
                        <Pressable
                            style={[styles.topActionButton,
                            { backgroundColor: theme.colors.tabIconSelected }
                            ]}
                            onPress={() => setIsDeleteModalVisible(true)}>
                            <FontAwesome6 name="trash" size={24} color={theme.colors.text} />
                        </Pressable>
                    </View>
                    {!hasImageUrl ? (
                        <TouchableOpacity
                            onPress={openImageEditor}
                            disabled={updateItemMutation.isPending}
                            style={[
                                styles.imageContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderRadius: 10,
                                    padding: 20,
                                    alignItems: "center",
                                    justifyContent: "center",
                                },
                            ]}
                        >
                            <ThemedText style={{ textAlign: "center" }}>
                                No image found for this item.
                            </ThemedText>
                            <View
                                style={{
                                    position: "absolute",
                                    right: 6,
                                    top: 6,
                                    borderRadius: 12,
                                    padding: 4,
                                }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={openImageEditor}
                            disabled={updateItemMutation.isPending}
                            className="imageContainer"
                            style={[
                                styles.imageContainer,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderRadius: 10,
                                    overflow: "hidden",
                                },
                            ]}
                        >
                            <Image
                                source={{ uri }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="cover"
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
                        </TouchableOpacity>
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
                                Category:
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
                                {displayValue(category, "category")}
                            </ThemedText>
                        </View>
                        <View
                            className="editContainer"
                            style={{
                                flexGrow: 1,
                                alignItems: "flex-end",
                                justifyContent: "center",
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setIsCategoryModalVisible(true);
                                }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
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
                                {displayValue(pattern, "pattern")}
                            </ThemedText>
                        </View>
                        <View
                            className="editContainer"
                            style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setIsPatternModalVisible(true);
                                }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {(pattern === "SOLID" || color) && (
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
                                            backgroundColor: color || DEFAULT_COLOR,
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
                                style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        if (pattern !== "SOLID") {
                                            Toast.show({
                                                type: "info",
                                                text1: "Color editing is for solid items",
                                                text2: "Set pattern to Solid to edit color.",
                                            });
                                            return;
                                        }
                                        setTempColor(color || DEFAULT_COLOR);
                                        setIsColorModalVisible(true);
                                    }}
                                >
                                    <Ionicons
                                        name="create"
                                        size={20}
                                        color={theme.colors.text}
                                    />
                                </TouchableOpacity>
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
                                Event:
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
                                {displayValue(event, "formality")}
                            </ThemedText>
                        </View>
                        <View
                            className="editContainer"
                            style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setIsFormalityModalVisible(true);
                                }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
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
                                {displayValue(material, "material")}
                            </ThemedText>
                        </View>
                        <View
                            className="editContainer"
                            style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setIsMaterialModalVisible(true);
                                }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
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
                                {getOptionLabel(
                                    FIT_OPTIONS,
                                    convertedFit === 0 ? "SLIM" : convertedFit === 1 ? "REGULAR" : "LOOSE",
                                )}
                            </ThemedText>
                        </View>
                        <View
                            className="editContainer"
                            style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setIsFitModalVisible(true);
                                }}
                            >
                                <Ionicons
                                    name="create"
                                    size={20}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
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
                                    {displayValue(season, "season")}
                                </ThemedText>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsSeasonModalVisible(true);
                                    }}
                                >
                                    <Ionicons
                                        name="create"
                                        size={20}
                                        color={theme.colors.text}
                                    />
                                </TouchableOpacity>
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
                                style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsSeasonModalVisible(true);
                                    }}
                                >
                                    <Ionicons
                                        name="create"
                                        size={20}
                                        color={theme.colors.text}
                                    />
                                </TouchableOpacity>
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
                                    {displayValue(length, "length")}
                                </ThemedText>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsLengthModalVisible(true);
                                    }}
                                >
                                    <Ionicons
                                        name="create"
                                        size={20}
                                        color={theme.colors.text}
                                    />
                                </TouchableOpacity>
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
                                style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsLengthModalVisible(true);
                                    }}
                                >
                                    <Ionicons
                                        name="create"
                                        size={20}
                                        color={theme.colors.text}
                                    />
                                </TouchableOpacity>
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
                                    {displayValue(bulk, "bulk")}
                                </ThemedText>
                            </View>
                            <View
                                className="editContainer"
                                style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsBulkModalVisible(true);
                                    }}
                                >
                                    <Ionicons
                                        name="create"
                                        size={20}
                                        color={theme.colors.text}
                                    />
                                </TouchableOpacity>
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
                                style={{ flexGrow: 1, alignItems: "flex-end", justifyContent: "center" }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setIsBulkModalVisible(true);
                                    }}
                                >
                                    <Ionicons
                                        name="create"
                                        size={20}
                                        color={theme.colors.text}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

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
                            <TouchableOpacity
                                onPress={() => {
                                    setDraftImageUri(uri ?? null);
                                    setIsImageModalVisible(false);
                                }}
                                disabled={updateItemMutation.isPending}
                                style={[
                                    styles.confirmBtn,
                                    {
                                        backgroundColor: theme.colors.card,
                                        opacity: updateItemMutation.isPending ? 0.7 : 1,
                                    },
                                ]}
                            >
                                <ThemedText style={{ fontFamily: theme.fonts.bold }}>
                                    Cancel
                                </ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveImageChanges}
                                disabled={updateItemMutation.isPending}
                                style={[
                                    styles.confirmBtn,
                                    {
                                        backgroundColor: theme.colors.tabIconSelected,
                                        opacity: updateItemMutation.isPending ? 0.7 : 1,
                                    },
                                ]}
                            >
                                {updateItemMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <ThemedText style={{ fontFamily: theme.fonts.bold }}>
                                        Save
                                    </ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <EditModal
                modalVisible={isCategoryModalVisible}
                setModalVisible={setIsCategoryModalVisible}
                value={category}
                onSelect={(nextCategory) => {
                    setCategory(nextCategory);
                    updateItemMutation.mutate({ type: nextCategory });
                }}
                options={CATEGORY_OPTIONS}
                title="Edit Category"
                isSaving={updateItemMutation.isPending}
            />

            <EditModal
                modalVisible={isPatternModalVisible}
                setModalVisible={setIsPatternModalVisible}
                value={pattern}
                onSelect={(nextPattern) => {
                    setPattern(nextPattern);
                    if (nextPattern === "SOLID") {
                        const nextColor = color || DEFAULT_COLOR;
                        setColor(nextColor);
                        setTempColor(nextColor);
                        updateItemMutation.mutate({ pattern: nextPattern, color: nextColor });
                        setIsColorModalVisible(true);
                        return;
                    }

                    setColor(null);
                    updateItemMutation.mutate({ pattern: nextPattern, color: null });
                }}
                options={PATTERN_OPTIONS}
                title="Edit Pattern"
                isSaving={updateItemMutation.isPending}
            />

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
                                color={tempColor}
                                onColorChange={(nextColor) => setTempColor(nextColor)}
                                onColorChangeComplete={(nextColor) => setTempColor(nextColor)}
                                style={{ width: "100%" }}
                            />
                        </View>
                        <View style={styles.confirmActions}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: theme.colors.lightBrown }]}
                                onPress={() => {
                                    setTempColor(color || DEFAULT_COLOR);
                                    setIsColorModalVisible(false);
                                }}
                                disabled={updateItemMutation.isPending}
                            >
                                <ThemedText>Cancel</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.confirmBtn,
                                    {
                                        backgroundColor: theme.colors.tabIconSelected,
                                        opacity: updateItemMutation.isPending ? 0.7 : 1,
                                    },
                                ]}
                                onPress={() => {
                                    setColor(tempColor);
                                    updateItemMutation.mutate({ color: tempColor });
                                    setIsColorModalVisible(false);
                                }}
                                disabled={updateItemMutation.isPending}
                            >
                                {updateItemMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <ThemedText style={{ color: theme.colors.text }}>Save</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <EditModal
                modalVisible={isFormalityModalVisible}
                setModalVisible={setIsFormalityModalVisible}
                value={event}
                onSelect={(nextFormality) => {
                    setEvent(nextFormality);
                    updateItemMutation.mutate({ formality: nextFormality });
                }}
                options={FORMALITY_OPTIONS}
                title="Edit Formality"
                isSaving={updateItemMutation.isPending}
            />

            <EditModal
                modalVisible={isMaterialModalVisible}
                setModalVisible={setIsMaterialModalVisible}
                value={material}
                onSelect={(nextMaterial) => {
                    setMaterial(nextMaterial);
                    updateItemMutation.mutate({ material: nextMaterial });
                }}
                options={MATERIAL_OPTIONS}
                title="Edit Material"
                isSaving={updateItemMutation.isPending}
            />

            <EditModal
                modalVisible={isFitModalVisible}
                setModalVisible={setIsFitModalVisible}
                value={convertedFit === 0 ? "SLIM" : convertedFit === 1 ? "REGULAR" : "LOOSE"}
                onSelect={(nextFit) => {
                    setFit(fitToSliderValue(nextFit));
                    updateItemMutation.mutate({ fit: nextFit });
                }}
                options={FIT_OPTIONS}
                title="Edit Fit"
                isSaving={updateItemMutation.isPending}
            />

            <EditModal
                modalVisible={isSeasonModalVisible}
                setModalVisible={setIsSeasonModalVisible}
                value={season}
                onSelect={(nextSeason) => {
                    setSeason(nextSeason);
                    updateItemMutation.mutate({ seasonWear: nextSeason });
                }}
                options={SEASON_OPTIONS}
                title="Edit Season"
                isSaving={updateItemMutation.isPending}
            />

            <EditModal
                modalVisible={isLengthModalVisible}
                setModalVisible={setIsLengthModalVisible}
                value={length}
                onSelect={(nextLength) => {
                    setLength(nextLength);
                    updateItemMutation.mutate({ length: nextLength });
                }}
                options={LENGTH_OPTIONS}
                title="Edit Length"
                isSaving={updateItemMutation.isPending}
            />

            <EditModal
                modalVisible={isBulkModalVisible}
                setModalVisible={setIsBulkModalVisible}
                value={bulk}
                onSelect={(nextBulk) => {
                    setBulk(nextBulk);
                    updateItemMutation.mutate({ bulk: nextBulk });
                }}
                options={BULK_OPTIONS}
                title="Edit Bulk"
                isSaving={updateItemMutation.isPending}
            />

            <Modal
                visible={isDeleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDeleteModalVisible(false)}
            >
                <View style={styles.confirmOverlay}>
                    <View style={[styles.confirmCard, { backgroundColor: theme.colors.card }]}>
                        <ThemedText style={{
                            fontSize: theme.sizes.h2,
                            fontWeight: "700",
                            marginBottom: 8,
                            fontFamily: theme.fonts.bold,
                        }}>Delete this item?</ThemedText>
                        <ThemedText style={styles.confirmText}>
                            This action cannot be undone. This will remove this item from any outfits it's included in, and will remove outfit as well.
                        </ThemedText>

                        <View style={styles.confirmActions}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: theme.colors.lightBrown }]}
                                onPress={() => setIsDeleteModalVisible(false)}
                                disabled={deleteItemMutation.isPending}
                            >
                                <ThemedText>Cancel</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: theme.colors.tabIconSelected, opacity: deleteItemMutation.isPending ? 0.7 : 1 }]}
                                onPress={handleDeleteItem}
                                disabled={deleteItemMutation.isPending}
                            >
                                {deleteItemMutation.isPending ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <ThemedText style={{ color: theme.colors.text }}>Delete</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = {
    container: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        width: "100%",
        height: "100%",
        paddingHorizontal: 30,
        alignItems: "stretch",
        paddingVertical: 20
    },
    chevronView: {
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 20,
        width: "100%",
        flexDirection: "row",
    },
    topActionButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    imageContainer: {
        height: 200,
        width: 200,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    responseContainer: {
        width: "100%",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        flexDirection: "row",
        marginTop: 20,
    },
    deleteBtn: {
        marginTop: 24,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
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
    logoWrap: {
        marginBottom: 10,
        transform: [{ scale: 2 }],
    },
    confirmText: {
        textAlign: "center",
        marginBottom: 16,
    },
    confirmActions: {
        marginTop: "10%",
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
    colorPreviewBadge: {
        marginTop: 14,
        marginBottom: 16,
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 8,
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
    imageModalBody: {
        width: "100%",
        height: 400,
    },
};
