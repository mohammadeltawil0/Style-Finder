import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "./themed-text";
import { useEffect, useState } from "react";
import Entypo from '@expo/vector-icons/Entypo';

export function TogglePreview({ uri, previewMode, setPreviewMode }) {
    const [imageFailed, setImageFailed] = useState(false);
    const [localTogglePreview, setLocalTogglePreview] = useState(false);

    const theme = useTheme();
    const isControlled = typeof previewMode === "boolean" && typeof setPreviewMode === "function";
    const togglePreview = isControlled ? previewMode : localTogglePreview;
    const handleTogglePreview = () => {
        if (isControlled) {
            setPreviewMode(!togglePreview);
            return;
        }
        setLocalTogglePreview(!togglePreview);
    };

    useEffect(() => {
        setImageFailed(false);
    }, [uri]);

    return (
        uri && !imageFailed && (
            <View style={{ alignItems: "center", width: "100%" }}>
                <Pressable
                    className="toggleHeader"
                    onPress={handleTogglePreview}
                    style={{ alignItems: "center", backgroundColor: theme.colors.lightBrown, borderRadius: 10, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 30, paddingHorizontal: 30, paddingVertical: 10, width: "100%" }}>
                    <ThemedText style={{ fontSize: theme.sizes.h2, color: theme.colors.text, textAlign: "center" }}>
                    Preview Image
                </ThemedText>
                <Entypo name="chevron-small-down" size={24} color="black" />
                </Pressable>
                {togglePreview &&
                    (<Image
                        source={{ uri }}
                        contentFit="cover"
                        // height will look weird if loaded in the web since that image will be landscape
                        style={{ width: "100%", aspectRatio: 1, marginTop: 20, borderRadius: 10 }}
                        onError={() => setImageFailed(true)}
                    />)}
            </View>
        )
    )
}
