import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { Alert, Button, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from "./themed-text";
import { useTheme } from "@react-navigation/native";

export const Camera = ({ setUri, setPage, uri }) => {
    const [permission, requestPermission] = useCameraPermissions();
    const ref = useRef(null);
    const [facing, setFacing] = useState("back");

    const theme = useTheme();

    if (!permission) return null;

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={{ textAlign: "center", marginBottom: 12 }}>
                    We need your permission to use the camera
                </Text>
                <Button onPress={requestPermission} title="Grant permission" />
            </View>
        );
    }

    const pickImage = async () => {
        // 1. Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your photos to make this work!');
            return;
        }

        // 2. Launch the library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Limit to images
            allowsEditing: true,    // Allows cropping/rotating
            aspect: [4, 3],         // Fixed aspect ratio for cropping
            quality: 1,             // Highest quality
        });

        // 3. Handle the result
        if (!result.canceled) {
            setUri(result.assets[0].uri);
        }
    };

    const takePicture = async () => {
        const photo = await ref.current?.takePictureAsync();
        if (photo?.uri) setUri(photo.uri);
    };

    const toggleFacing = () => {
        setFacing((prev) => (prev === "back" ? "front" : "back"));
    };

    if (uri) {
        return (
            <View style={styles.previewContainer}>
                <Image
                    source={{ uri }}
                    contentFit="contain"
                    style={styles.previewImage}
                />
                <View style={styles.navigationButtons}>
                    <Pressable onPress={() => setUri(null)} style={{ backgroundColor: theme.colors.card, borderRadius: 10, padding: 10, width: "35%" }}>
                        <ThemedText style={{ textAlign: "center" }}>
                            Change Photo
                        </ThemedText>
                    </Pressable>
                    <Pressable
                        style={{ backgroundColor: theme.colors.card, borderRadius: 10, padding: 10, width: "35%" }}
                        onPress={() => setPage(2)}
                    >
                        <ThemedText style={{ textAlign: "center" }}>
                            Next
                        </ThemedText>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                ref={ref}
                facing={facing}
                pointerEvents="none"
                animateShutter={false}
            />
            <View style={styles.shutterContainer}>
                <Pressable onPress={toggleFacing} style={styles.iconBtn}>
                    <FontAwesome6 name="rotate-left" size={32} color="white" />
                </Pressable>
                <Pressable onPress={takePicture}>
                    {({ pressed }) => (
                        <View style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}>
                            <View style={styles.shutterBtnInner} />
                        </View>
                    )}
                </Pressable>
                <Pressable onPress={pickImage} style={styles.iconBtn}>
                    <FontAwesome name="photo" size={32} color="white" />
                </Pressable>
            </View>
            <View style={styles.nextButton}>
                <Pressable
                    style={{ alignSelf: "flex-end", backgroundColor: theme.colors.card, borderRadius: 10, padding: 10, width: "35%" }}
                    onPress={() => setPage(2)}
                >
                    <ThemedText style={{ textAlign: "center" }}>
                        Skip Image
                    </ThemedText>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // TO DO: make sure permission style is how i like it; i dont remember LOL
    permissionContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    //TO DO: how much height do we want to give user????
    camera: {
        height: "80%",
        width: "90%"
    },
    shutterContainer: {
        alignItems: "center",
        bottom: 44,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 30,
        paddingHorizontal: 40,
        position: "absolute",
        width: "90%"
    },
    shutterBtn: {
        backgroundColor: "transparent",
        borderWidth: 5,
        borderColor: "white",
        width: 85,
        height: 85,
        borderRadius: 45,
        alignItems: "center",
        justifyContent: "center",
    },
    shutterBtnInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "white",
    },
    iconBtn: {
        width: 40,
        alignItems: "center",
    },
    previewContainer: {
        flex: 1,
    },
    previewImage: {
        flex: 1,
    },
    navigationButtons: {
        alignItems: "center",
        flexDirection: "row",
        gap: 40,
        justifyContent: "center",
        padding: 20,
        position: "absolute",
        bottom: 10,
        width: "100%",
    },
    nextButton: {
        alignSelf: "flex-end",
        paddingRight: 20,
        position: "absolute",
        bottom: 10,
        width: "100%",
    }
});