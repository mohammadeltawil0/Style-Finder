import { useState } from "react";
import { useRouter } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function ProfilePic({ username, style, containerStyle }) {
    const router = useRouter();
    const [profilePic, setProfilePic] = useState(
        require("../assets/images/placeholder.png")
    );
    const theme = useTheme();

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
            <TouchableOpacity onPress={() => router.push("/settings/Profile")}>
                <Image
                    source={profilePic}
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

