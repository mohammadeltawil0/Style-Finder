import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../scripts/apiClient";

const MAX_DATA_URI_LENGTH = 250000;

export default function ProfilePic({ username, style, containerStyle, imageUrl, onPress }) {
    const router = useRouter();
    const queryClient = useQueryClient();
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

            if (savedImageUrl && isSupportedImageSource(savedImageUrl)) {
                return savedImageUrl;
            }

            if (savedImageUrl && !isSupportedImageSource(savedImageUrl)) {
                await AsyncStorage.setItem("profileImageUrl", "");
            }

            const storedUserId = await AsyncStorage.getItem("userId");
            const parsedUserId = Number(storedUserId);

            if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
                return "";
            }

            try {
                const response = await apiClient.get(`/api/users/${parsedUserId}`);
                const remoteImageUrl = response?.data?.profileImageUrl || "";

                if (isSupportedImageSource(remoteImageUrl)) {
                    await AsyncStorage.setItem("profileImageUrl", remoteImageUrl);
                    return remoteImageUrl;
                }

                await AsyncStorage.setItem("profileImageUrl", "");
                return "";
            } catch (error) {
                console.error("Failed to fetch profile image:", error?.response?.data || error?.message || error);
                return "";
            }
        },
        staleTime: 30000,
    });

    useFocusEffect(
        useCallback(() => {
            queryClient.invalidateQueries({ queryKey: ["profileImageUrl"] });
        }, [queryClient])
    );

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

