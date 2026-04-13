import { Alert, TextInput, TouchableOpacity, View } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import ProfilePic from "../../components/profile-pic";
import { apiClient } from "../../scripts/apiClient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

function EditProfile() {
    const theme = useTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [username, setUsername] = useState("");
    const [editedUsername, setEditedUsername] = useState("");
    const [originalUsername, setOriginalUsername] = useState("");
    const [name, setName] = useState("");
    const [originalName, setOriginalName] = useState("");
    const [email, setEmail] = useState("");
    const [originalEmail, setOriginalEmail] = useState("");
    const [userId, setUserId] = useState(null);
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [originalProfileImageUrl, setOriginalProfileImageUrl] = useState("");
    const popularEmailDomains = [
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com",
        "icloud.com",
    ];

    // validate correct email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        const domain = email.split("@")[1]?.toLowerCase();
        return popularEmailDomains.includes(domain);
    };

    const usernameAvailabilityQuery = useQuery({
        queryKey: ["usernameExists", editedUsername.trim()],
        enabled: false,
        retry: false,
        staleTime: 0,
        queryFn: async () => {
            const trimmedUsername = editedUsername.trim();

            if (!trimmedUsername || trimmedUsername === originalUsername.trim()) {
                return false;
            }

            const response = await apiClient.get("/api/users/exists", {
                params: { username: trimmedUsername },
            });

            return Boolean(response.data);
        },
    });

    console.log("Username availability query:", {
        username,
        originalUsername,
        data: usernameAvailabilityQuery.data
    });

    const pickProfileImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert("Permission Denied", "Please grant photo library access to update your profile picture.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImageUrl(result.assets[0].uri);
        }
    };

    const convertToBase64 = async (uri) => {
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: "base64",
        });
        return `data:image/jpeg;base64,${base64}`;
    };

    const updateUserProfile = async ({ payload }) => {
        let response;
        try {
            response = await apiClient.put(`/api/users/${userId}`, payload);
        } catch (error) {
            if (error?.response?.status === 500) {
                const fallbackPayload = {
                    firstName: payload.firstName,
                    username: payload.username,
                    email: payload.email,
                };
                response = await apiClient.put(`/api/users/${userId}`, fallbackPayload);
            } else {
                throw error;
            }
        }

        return response.data;
    };

    const { mutate, isPending } = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: async (updatedUser, variables) => {
            await AsyncStorage.setItem("username", updatedUser.username || "");
            await AsyncStorage.setItem("profileImageUrl", updatedUser.profileImageUrl || "");

            queryClient.setQueryData(["profileImageUrl"], updatedUser.profileImageUrl || "");
            queryClient.invalidateQueries({ queryKey: ["profileImageUrl"] });

            setUsername(updatedUser.username || "");
            setEditedUsername(updatedUser.username || "");
            setOriginalUsername(updatedUser.username || "");
            setOriginalName(updatedUser.firstName || "");
            setOriginalEmail(updatedUser.email || "");
            setOriginalProfileImageUrl(updatedUser.profileImageUrl || "");

            if (variables?.hasChanges) {
                Toast.show({ type: "success", text1: "Profile updated" });
            }
            router.back();
        },
        onError: async (error) => {
            const status = error?.response?.status;
            if (status === 404) {
                await AsyncStorage.multiRemove(["username", "userId", "profileImageUrl"]);
                Toast.show({ type: "error", text1: "Session expired", text2: "Please log in again." });
                router.replace("/auth/logIn");
                return;
            }

            const backendMessage = error?.response?.data?.message || error?.response?.data?.error;
            const messages = {
                400: backendMessage || "Invalid profile data.",
                409: "Username already exists.",
                500: "Server error. Please try again.",
            };

            Toast.show({
                type: "error",
                text1: "Failed to update profile",
                text2: messages[status] || backendMessage || "Something went wrong.",
            });
        },
    });

    const handleSaveChanges = async () => {
        if (!userId) {
            Toast.show({ type: "error", text1: "User not found", text2: "Please log in again." });
            return;
        }

        // Tracks if any changes to the form
        const hasChanges =
            name.trim() !== originalName.trim() ||
            editedUsername.trim() !== originalUsername.trim() ||
            email.trim() !== originalEmail.trim() ||
            profileImageUrl !== originalProfileImageUrl;

        const trimmedUsername = editedUsername.trim();

        if (trimmedUsername === "") {
            Toast.show({ type: "error", text1: "Username required", text2: "Please enter a username." });
            return;
        }

        if (email.trim() === "") {
            Toast.show({ type: "error", text1: "Email required", text2: "Please enter an email address." });
            return;
        }

        if (!isValidEmail(email.trim())) {
            Toast.show({
                type: "error",
                text1: "Invalid email",
                text2: "Please use a valid domain.",
            });
            return;
        }

        if (usernameAvailabilityQuery.data) {
            Toast.show({ type: "error", text1: "Username already exists", text2: "Please choose another username." });
            return;
        }

        let profileImageData = profileImageUrl || null;

        // Convert local image URI to data URL; keep existing remote/data URL unchanged.
        if (profileImageUrl && !profileImageUrl.startsWith("data:image")) {
            profileImageData = await convertToBase64(profileImageUrl);
        }

        const payload = {
            firstName: name,
            username: editedUsername,
            email,
            profileImageUrl: profileImageData,
        };

        mutate({ payload, hasChanges });
    };


    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem("userId");
                if (!storedUserId) return;

                const parsedUserId = Number(storedUserId);
                if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) return;

                const response = await apiClient.get(`/api/users/${parsedUserId}`);
                const user = response.data;

                setUserId(parsedUserId);

                setName(user.firstName || "");
                setOriginalName(user.firstName || "");
                setUsername(user.username || "");
                setEditedUsername(user.username || "");
                setOriginalUsername(user.username || "");
                setEmail(user.email || "");
                setOriginalEmail(user.email || "");
                setProfileImageUrl(user.profileImageUrl || "");
                setOriginalProfileImageUrl(user.profileImageUrl || "");
            } catch (error) {
                console.error("Failed to load user profile:", error?.response?.data || error?.message || error);
            }
        };

        loadUser();
    }, []);

    return (
        <ThemedView
            gradient
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
            <View
                className="content"
                style={{
                    flex: 1,
                    width: "80%",
                    paddingHorizontal: 20,
                    paddingVertical: 30,
                    alignItems: "stretch",
                    gap: 30,
                }}
            >
                <View className="profile-and-name" style={{ alignItems: "center", gap: 12 }}>
                    <View style={{ position: "relative" }}>
                        <ProfilePic
                            username={username}
                            imageUrl={profileImageUrl}
                            onPress={pickProfileImage}
                            style={{
                                height: 200,
                                width: 200,
                            }}
                            containerStyle={{
                                backgroundColor: "transparent",
                                padding: 0,
                                borderRadius: 16,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 8 },
                                shadowOpacity: 0.25,
                                shadowRadius: 10,
                                elevation: 12,
                            }}
                        />
                        <View
                            style={{
                                position: "absolute",
                                right: 6,
                                top: 6,
                                borderRadius: 12,
                                padding: 4,
                            }}
                        >
                            <TouchableOpacity onPress={pickProfileImage}>
                                <AntDesign name="edit" size={20} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ThemedText
                        style={{
                            fontSize: theme.sizes.h2,
                            color: theme.colors.h2,
                            fontFamily: theme.fonts.bold,
                        }}
                    >
                        {username}
                    </ThemedText>
                </View>
                <View className="edit-name" style={{ flexDirection: "column", gap: 12 }}>
                    <ThemedText style={{ fontSize: theme.sizes.h3, color: theme.colors.text, fontFamily: theme.fonts.bold }}>
                        Name:
                    </ThemedText>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        style={{
                            borderRadius: 10,
                            padding: 10,
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            fontFamily: theme.fonts.regular
                        }}
                    />

                </View>
                <View className="edit-username" style={{ flexDirection: "column", gap: 12 }}>
                    <ThemedText style={{ fontSize: theme.sizes.h3, color: theme.colors.text, fontFamily: theme.fonts.bold }}>
                        Username:
                    </ThemedText>
                    <TextInput
                        value={editedUsername}
                        onChangeText={(value) => {
                            setEditedUsername(value);
                            queryClient.removeQueries({ queryKey: ["usernameExists"] });
                        }}
                        onBlur={async () => {
                            try {
                                await usernameAvailabilityQuery.refetch();
                            } catch (error) {
                                console.error("Failed to check username availability:", error?.response?.data || error?.message || error);
                            }
                        }}
                        placeholder="Enter your username"
                        style={{
                            borderRadius: 10,
                            padding: 10,
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            fontFamily: theme.fonts.regular
                        }}
                    />
                    {usernameAvailabilityQuery.isFetching && (
                        <ThemedText style={{ fontSize: theme.sizes.h4, color: theme.colors.text }}>
                            Checking availability...
                        </ThemedText>
                    )}
                    {usernameAvailabilityQuery.data && (
                        <ThemedText style={{ fontSize: theme.sizes.h4, color: "#c1121f" }}>
                            Username already exists.
                        </ThemedText>
                    )}

                </View>
                <View className="edit-email" style={{ flexDirection: "column", gap: 12 }}>
                    <ThemedText style={{ fontSize: theme.sizes.h3, color: theme.colors.text, fontFamily: theme.fonts.bold }}>
                        Email:
                    </ThemedText>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        style={{
                            borderRadius: 10,
                            padding: 10,
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            fontFamily: theme.fonts.regular
                        }}
                    />

                </View>
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.colors.lightBrown,
                        padding: 10,
                        borderRadius: 10,
                        opacity: isPending ? 0.7 : 1,
                    }}
                    onPress={handleSaveChanges}
                    disabled={isPending}
                >
                    <ThemedText style={{
                        fontSize: theme.sizes.h3,
                        color: theme.colors.text,
                        fontFamily: theme.fonts.bold,
                        textAlign: "center",
                    }}>
                        {isPending ? "Saving..." : "Save Changes"}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

export default EditProfile;
