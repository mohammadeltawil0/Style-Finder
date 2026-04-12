import { ThemedText, ThemedView } from "components";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { TextInput, TouchableOpacity, View } from "react-native";

export default function UpdatePassword() {
    const theme = useTheme();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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
                    Your new password needs to be different from your old passwords.
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
            <TouchableOpacity style={{ backgroundColor: theme.colors.tabIconSelected, padding: 10, borderRadius: 10 }} onPress={() => {
                // TO DO: add save changes functionality
                router.replace("/settings/Profile");
            }}>
                <ThemedText style={{
                    fontSize: theme.sizes.h3,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bold,
                    textAlign: "center",
                }}>
                    Save Changes
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    )
}