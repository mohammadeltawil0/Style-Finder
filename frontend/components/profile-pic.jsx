import { useState } from "react";
import { useRouter } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";

const MAX_DATA_URI_LENGTH = 250000;

export default function ProfilePic({ username, style, containerStyle, imageUrl, onPress }) {
    const router = useRouter();
    const [profilePic] = useState(
        require("../assets/images/placeholder.png")
    );

    const isSupportedImageSource = (value) => {
        if (typeof value !== "string" || !value.trim()) {
            return false;
        }

        if (value.startsWith("data:image/") && value.length > MAX_DATA_URI_LENGTH) {
            return false;
        }

        return (
            value.startsWith("data:image/") ||
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("file://")
        );
    };

    const { data: cachedProfileImageUrl = "" } = useQuery({
        queryKey: ["profileImageUrl"],
        queryFn: async () => {
            const savedImageUrl = await AsyncStorage.getItem("profileImageUrl");

            if (!savedImageUrl) {
                return "";
            }

            if (!isSupportedImageSource(savedImageUrl)) {
                await AsyncStorage.setItem("profileImageUrl", "");
                return "";
            }

            return savedImageUrl;
        },
        staleTime: 0,
    });

    const resolvedImageUrl = imageUrl || cachedProfileImageUrl;
    const source = isSupportedImageSource(resolvedImageUrl)
        ? { uri: resolvedImageUrl }
        : profilePic;
    const handlePress = onPress || (() => router.push("/settings/Profile"));

    return (
        <View
            style={[
                {
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "center",
                    borderRadius: 12,
                    padding: 4,
                },
                containerStyle,
            ]}
        >
            <TouchableOpacity onPress={handlePress}>
                <Image
                    source={source}
                    style={[
                        {
                            borderRadius: 10,
                            width: 30,
                            height: 30,
                            alignSelf: "center"
                        },
                        style,
                    ]}
                    resizeMode="cover" />
            </TouchableOpacity>
        </View>
    )
}

