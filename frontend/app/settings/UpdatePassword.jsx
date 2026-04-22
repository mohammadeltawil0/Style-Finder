import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../scripts/apiClient";
import Toast from "react-native-toast-message";

function PasswordRules({ password }) {
    const rules = [
        { label: "At least 6 characters", pass: password.length >= 6 },
        { label: "One special character (@, #, $, &)", pass: /[@#$&]/.test(password) },
        { label: "One number", pass: /[0-9]/.test(password) },
    ];
    return (
        <View style={{ backgroundColor: "#f9f9f9", borderRadius: 10, borderWidth: 1, borderColor: "#ddd", padding: 10, marginBottom: 12 }}>
            {rules.map((rule, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 3 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: rule.pass ? "#43a047" : "#e53935" }} />
                    <Text style={{ fontSize: 13, color: rule.pass ? "#2e7d32" : "#c62828" }}>{rule.label}</Text>
                </View>
            ))}
        </View>
    );
}

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

        const passwordRules = [
            password.length >= 6,
            /[@#$&]/.test(password),
            /[0-9]/.test(password),
        ];
        if (!passwordRules.every(Boolean)) {
            Toast.show({
                type: "error",
                text1: "Weak Password",
                text2: "Password must meet all requirements.",
            });
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
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: theme.colors.card }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
            <ThemedView gradient={false} style={{ paddingHorizontal: 20, flex: 1, backgroundColor: theme.colors.card }}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, padding: 20 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    <View style={{ flex: 1, paddingVertical: 30, gap: 30, marginLeft: 15, width: "90%" }}>

                        <View style={{ width: "90%" }} className="header-text">
                            <ThemedText
                                style={{
                                    fontSize: theme.sizes.h1,
                                    fontFamily: theme.fonts.bold,
                                    marginBottom: 20,
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
                        <View className="edit-password" style={{ flexDirection: "column", gap: 12, marginBottom: 20, }}>
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
                            {password.length > 0 && <PasswordRules password={password} />}
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
                    </View>
                </ScrollView>
            </ThemedView >
        </KeyboardAvoidingView>
    )
}