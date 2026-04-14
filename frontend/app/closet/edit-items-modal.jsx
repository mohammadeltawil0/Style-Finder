import { ActivityIndicator, Image, Modal, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "../../components";
import Entypo from "@expo/vector-icons/Entypo";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "../../scripts/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const sanitize = (type, str) => {
    if (typeof str !== "string") return "";

    const titleCaseIfAllCaps = (value) => {
        if (!value) return value;
        const hasLetters = /[a-z]/i.test(value);
        if (!hasLetters || value !== value.toUpperCase()) return value;

        const lowered = value.toLowerCase();
        return lowered.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    if (type === "pattern") {
        if (str === "GEOMETRIC_OR_ABSTRACT") {
            return "Geometric/Abstract";
        } else if (str === "PLAID_OR_FLANNEL") {
            return "Plaid/Flannel";
        } else {
            return titleCaseIfAllCaps(str.replace(/[_-]/g, " "));
        }
    }

    if (type === "formality") {
        if (str === "PARTY_OR_NIGHT_OUT") {
            return "Party/Night Out";
        } else if (str === "ACTIVE_OR_SPORT") {
            return "Active/Sport";
        } else if (str === "WORK_OR_SMART") {
            return "Work/Smart";
        } else {
            return titleCaseIfAllCaps(str.replace(/[_-]/g, " "));
        }
    }

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

    return titleCaseIfAllCaps(str.replace(/[_-]/g, " "));
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

    return labelMap[key] ? MATERIAL_LABELS[labelMap[key]] : sanitize("material", raw);
};

// TO DO: edit item logic
export default function EditItemsModal({ item, setModalVisible }) {
    const [uri, setUri] = useState(null);
    const [category, setCategory] = useState("Top");
    const [pattern, setPattern] = useState("solid-unicolor");
    const [color, setColor] = useState("red");
    const [material, setMaterial] = useState("cotton");
    const [event, setEvent] = useState("casual");
    const [fit, setFit] = useState("regular");
    const [season, setSeason] = useState(null);
    const [length, setLength] = useState(null);
    const [bulk, setBulk] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

    const theme = useTheme();
    const queryClient = useQueryClient();

    console.log("Editing item:", item);
    const hasImageUrl = typeof uri === "string" && uri.trim().length > 0;
    console.log("Image URL check - uri:", uri, "hasImageUrl:", hasImageUrl);

    const fitToSliderValue = (value) => {
        if (typeof value === "number") return value;
        if (value === "SLIM") return 0;
        if (value === "REGULAR") return 1;
        if (value === "LOOSE") return 2;
        return 1;
    };

    const normalizeCategory = (value) => {
        if (!value) return "TOP";
        const map = {
            Top: "TOP",
            Bottom: "BOTTOM",
            Dress: "DRESS",
            Jacket: "JACKET",
            Accessory: "ACCESSORY",
            Shoes: "SHOES",
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
        setCategory(normalizeCategory(item.type || item.category));
        setPattern(normalizePattern(item.pattern));
        setColor(item.color || null);
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

    const deleteItemMutation = useMutation({
        mutationFn: async (itemId) => {
            await apiClient.delete(`/api/items/${itemId}`);
        },
        onSuccess: async () => {
            // Keep query keys aligned with ClosetScreen useQuery(['items', userId]).
            await queryClient.invalidateQueries({ queryKey: ["items"] });
            setIsDeleteModalVisible(false);
            setModalVisible(false);
        },
        onError: (error) => {
            console.error("Failed to delete item:", error);
        },
    });

    const handleDeleteItem = () => {
        const resolvedItemId = item?.itemId ?? item?.id;
        if (!resolvedItemId || deleteItemMutation.isPending) {
            console.error("Delete blocked: missing item id", item);
            return;
        }

        console.log("Deleting item id:", resolvedItemId);
        deleteItemMutation.mutate(resolvedItemId);
    };

    const displayValue = (value, type = null) => {
        if (value === null || value === undefined || value === "") return "Not specified";
        if (type === "pattern") return sanitize("pattern", value);
        if (type === "formality") return sanitize("formality", value);
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
        if (type === "length") return sanitize("length", value);
        if (type === "category") return sanitize("category", value);
        if (type === "season") return sanitize("season", value);
        return String(value).replace(/[_-]/g, " ");
    };

    return (
        <>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.colors.background,
                    },
                ]}
            >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: "stretch",
                        width: "100%",
                    }}
                >
                    <View className="chevronView" style={styles.chevronView}>
                        <Pressable
                            onPress={() => setModalVisible(false)}
                            style={{ width: 30, height: 30 }}
                        >
                            <Entypo name="chevron-left" size={30} color="black" />
                        </Pressable>
                    </View>
                    {!hasImageUrl ? (
                        <View
                            className="imageContainer"
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
                        </View>
                    ) : (
                        <View
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
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.deleteBtn, { backgroundColor: theme.colors.tabIconSelected }]}
                        onPress={() => setIsDeleteModalVisible(true)}
                    >
                        <ThemedText style={{ color: theme.colors.text, fontFamily: theme.fonts.bold }}>
                            Delete Item
                        </ThemedText>
                    </TouchableOpacity>
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
                            <Ionicons
                                name="create"
                                size={20}
                                color={theme.colors.text}
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
                                {displayValue(pattern, "pattern")}
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
                                        {displayValue(color)}
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
                            style={{ flexGrow: 1, alignItems: "flex-end" }}
                        >
                            <Ionicons
                                name="create"
                                size={20}
                                color={theme.colors.text}
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
                                {displayValue(material, "material")}
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
                                {displayValue(convertedFit === 0 ? "Skinny" : convertedFit === 1 ? "Regular" : "Oversized")}
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
                                    {displayValue(season, "season")}
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
                                    {displayValue(length, "length")}
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
                                    {displayValue(bulk, "bulk")}
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
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

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
                        }}>Delete this item?</ThemedText>
                        <ThemedText style={styles.confirmText}>
                            This action cannot be undone. This will also remove this item from any outfits it's included in, and will thus, remove the outfit as well.
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
        justifyContent: "flex-start",
        paddingVertical: 20,
        width: "100%",
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
    }
};
