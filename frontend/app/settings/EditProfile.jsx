import { TextInput, TouchableOpacity, View } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import AntDesign from '@expo/vector-icons/AntDesign';
import ProfilePic from "../../components/profile-pic";

function EditProfile() {
    const theme = useTheme();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");


    useEffect(() => {
        const loadUsername = async () => {
            const storedUsername = await AsyncStorage.getItem("username");
            if (storedUsername) {
                setUsername(storedUsername);
            }
        };

        loadUsername();
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
                        <ProfilePic username={username} style={{
                            height: 200, width: 200,
                        }} containerStyle={{
                            backgroundColor: "transparent",
                            padding: 0,
                            borderRadius: 16,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.25,
                            shadowRadius: 10,
                            elevation: 12
                        }} />
                        <View
                            style={{
                                position: "absolute",
                                right: 6,
                                top: 6,
                                borderRadius: 12,
                                padding: 4,
                            }}
                        >
                            {/* TO DO: add edit profile picture functionality */}
                            <AntDesign name="edit" size={20} color={theme.colors.text} />
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
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter your username"
                        style={{
                            borderRadius: 10,
                            padding: 10,
                            backgroundColor: theme.colors.background,
                            color: theme.colors.text,
                            fontFamily: theme.fonts.regular
                        }}
                    />

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
                <TouchableOpacity style={{ backgroundColor: theme.colors.lightBrown, padding: 10, borderRadius: 10 }} onPress={() => {
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
            </View>
        </ThemedView>
    );
}

export default EditProfile;
