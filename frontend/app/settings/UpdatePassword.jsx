import { ThemedText, ThemedView } from "components";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../scripts/apiClient";
import Toast from "react-native-toast-message";

export default function UpdatePassword() {
    const theme = useTheme();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [userId, setUserId] = useState(null);

    const updatePassword = async ({ password }) => {
        const response = await apiClient.put(`/api/users/${userId}`, {
            password,
        });

        return response.data;
    };

    const { mutate, isPending } = useMutation({
        mutationFn: updatePassword,
        onSuccess: async () => {
            Toast.show({ type: "success", text1: "Password updated" });
            router.back();
        },
        onError: (error) => {
            const status = error?.response?.status;
            const backendMessage = error?.response?.data?.message || error?.response?.data?.error;

            Toast.show({
                type: "error",
                text1: "Failed to update password",
                text2: status === 400
                    ? backendMessage || "Invalid password data."
                    : backendMessage || "Something went wrong.",
            });
        },
    });

    useEffect(() => {
        const loadUser = async () => {
            const storedUserId = await AsyncStorage.getItem("userId");
            if (!storedUserId) {
                return;
            }

            const parsedUserId = Number(storedUserId);
            if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
                setUserId(parsedUserId);

                const response = await apiClient.get(`/api/users/${parsedUserId}`);
                setCurrentPassword(response.data?.password || "");
            }
        };

        loadUser();
    }, []);

    const handleSaveChanges = () => {
        if (!userId) {
            Toast.show({ type: "error", text1: "User not found", text2: "Please log in again." });
            return;
        }

        if (password.trim() === "") {
            Toast.show({ type: "error", text1: "Password required", text2: "Please enter a new password." });
            return;
        }

        if (confirmPassword.trim() === "") {
            Toast.show({ type: "error", text1: "Confirm your password", text2: "Please re-enter the new password." });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({ type: "error", text1: "Passwords do not match", text2: "Please make sure both passwords match." });
            return;
        }

        if (password === currentPassword) {
            Toast.show({
                type: "error",
                text1: "Password unchanged",
                text2: "New password must be different from current.",
            });
            return;
        }

        mutate({ password });
    };

    return (
        <ThemedView gradient={true} style={{ paddingHorizontal: 20, flexDirection: "column", gap: 50, flex: 1, justifyContent: "flex-start"  }}>
            <View style={{ width: "90%" }} className="header-text">
                <ThemedText
                    style={{
                        fontSize: theme.sizes.h1,
                        fontFamily: theme.fonts.bold,
                    }}
                >Create New Password
                </ThemedText>
                <ThemedText style={{
                    fontSize: theme.sizes.h3,
                    color: theme.colors.text,
                }}>
                    Your new password needs to be different from your current password.
                </ThemedText>
            </View>
            <View className="edit-password" style={{ flexDirection: "column", gap: 12 }}>
                <ThemedText style={{ fontSize: theme.sizes.h3, color: theme.colors.text, fontFamily: theme.fonts.bold }}>
                    New Password:
                </ThemedText>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your new password"
                    secureTextEntry={true}
                    style={{
                        borderRadius: 10,
                        padding: 10,
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text,
                        fontFamily: theme.fonts.regular
                    }}
                />
            </View>
            <View className="edit-confirm-password" style={{ flexDirection: "column", gap: 12 }}>
                <ThemedText style={{ fontSize: theme.sizes.h3, color: theme.colors.text, fontFamily: theme.fonts.bold }}>
                    Confirm Password:
                </ThemedText>
                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your new password"
                    secureTextEntry={true}
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
                disabled={isPending}
                style={{ backgroundColor: theme.colors.tabIconSelected, padding: 10, borderRadius: 10, opacity: isPending ? 0.7 : 1 }}
                onPress={handleSaveChanges}
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
        </ThemedView>
    )
}