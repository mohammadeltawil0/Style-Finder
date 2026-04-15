import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { ThemedText } from "./themed-text";
import { useTheme } from "@react-navigation/native";

export const Camera = ({ setUri, setPage, uri }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef(null);
  const [facing, setFacing] = useState("back");
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [isTakingPicture, setIsTakingPicture] = useState(false);

  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === "web";
  const isWide = width >= 768;
  const buttonWidth = isWide ? 220 : "30%";
  const theme = useTheme();

  // this is specifically for web users or devices without cameras
  // TO DO: test this on a device w/o cam
  // TO DO: make a loading state for when we're checking for camera availability since that can take a sec
  useEffect(() => {
    const checkCameraAvailability = async () => {
      if (Platform.OS !== "web") {
        setIsCameraAvailable(true);
        return;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        setIsCameraAvailable(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setIsCameraAvailable(true);
      } catch {
        setIsCameraAvailable(false);
      }
    };

    checkCameraAvailability();
  }, []);

  if (!isCameraAvailable) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 40,
        }}
      >
        <ThemedText
          style={{
            textAlign: "center",
            fontSize: theme.sizes.text,
            marginBottom: 12,
          }}
        >
          No camera detected on this device. Please upload an image from your
          library instead.
        </ThemedText>
        <Pressable
          style={{
            alignSelf: "center",
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            paddingVertical: 10,
            width: buttonWidth,
          }}
          onPress={() => setPage(2)}
        >
          <ThemedText style={{ textAlign: "center" }}>Skip Image</ThemedText>
        </Pressable>
      </View>
    );
  }
  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ThemedText
          style={{
            textAlign: "center",
            fontSize: theme.sizes.text,
            marginBottom: 12,
          }}
        >
          We need your permission to use the camera
        </ThemedText>
        <Pressable onPress={requestPermission}>
          <ThemedText
            style={{
              backgroundColor: theme.colors.tabIconSelected,
              color: theme.colors.text,
              fontFamily: "semiBold",
              fontSize: theme.sizes.h3,
              padding: 10,
              borderRadius: 5,
            }}
          >
            GRANT PERMISSION
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  const pickImage = async () => {
    // 1. Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "We need access to your photos to make this work!",
      });
      return;
    }

    // 2. Launch the library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Limit to images
      allowsEditing: true, // Allows cropping/rotating
      aspect: [1, 1], // Fixed aspect ratio for cropping
      quality: 1, // Highest quality
    });

    // 3. Handle the result
    if (!result.canceled) {
      setUri(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (isTakingPicture || !ref.current) return;

    setIsTakingPicture(true);
    try {
      const photo = await ref.current.takePictureAsync();
      if (photo?.uri) setUri(photo.uri);
    } catch (error) {
      const message = String(error?.message ?? error);
      if (!message.includes("Camera unmounted during taking photo process")) {
        Toast.show({
          type: "error",
          text1: "Camera Error",
          text2: "Could not take photo. Please try again.",
        });
      }
    } finally {
      setIsTakingPicture(false);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  if (uri) {
    return (
      <>
        <View
          style={[styles.previewContainer, isWeb && styles.previewContainerWeb]}
        >
          <Image
            source={{ uri }}
            contentFit="cover"
            style={[styles.previewImage, isWeb && styles.previewImageWeb]}
          />
        </View>
        <View
          style={[
            styles.navigationButtons,
            isWeb && styles.navigationButtonsWeb,
          ]}
        >
          <Pressable
            onPress={() => setUri(null)}
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: 150,
            }}
          >
            <ThemedText style={{ textAlign: "center" }}>
              Change Photo
            </ThemedText>
          </Pressable>
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: buttonWidth,
            }}
            onPress={() => setPage(2)}
          >
            <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <View style={[styles.container, isWeb && styles.containerWeb]}>
      <CameraView
        style={[styles.camera, isWeb && styles.cameraWeb]}
        ref={ref}
        facing={facing}
        pointerEvents="none"
        animateShutter={false}
      />
      <View
        style={[styles.shutterContainer, isWeb && styles.shutterContainerWeb]}
      >
        <Pressable
          onPress={toggleFacing}
          style={styles.iconBtn}
          disabled={isTakingPicture}
        >
          <FontAwesome6 name="rotate-left" size={32} color="white" />
        </Pressable>
        <Pressable onPress={takePicture} disabled={isTakingPicture}>
          <View style={[styles.shutterBtn]}>
            <View style={styles.shutterBtnInner} />
          </View>
        </Pressable>
        <Pressable
          onPress={pickImage}
          style={styles.iconBtn}
          disabled={isTakingPicture}
        >
          <FontAwesome name="photo" size={32} color="white" />
        </Pressable>
      </View>
      <View style={[styles.nextButton, isWeb && styles.nextButtonWeb]}>
        <Pressable
          style={{
            alignSelf: "center",
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            paddingVertical: 10,
            width: buttonWidth,
          }}
          onPress={() => setPage(2)}
          disabled={isTakingPicture}
        >
          <ThemedText style={{ textAlign: "center" }}>Skip Image</ThemedText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  containerWeb: {
    maxWidth: 680,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 6,
  },
  //TO DO: how much height do we want to give user????
  camera: {
    alignSelf: "center",
    width: "90%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  cameraWeb: {
    width: "100%",
    maxWidth: 560,
  },
  shutterContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: 40,
    width: "90%",
  },
  shutterContainerWeb: {
    position: "relative",
    bottom: 0,
    width: "100%",
    maxWidth: 560,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingBottom: 0,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 60,
    height: 60,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 45,
    height: 45,
    borderRadius: 35,
    backgroundColor: "white",
  },
  iconBtn: {
    width: 40,
    alignItems: "center",
  },
  previewContainer: {
    alignItems: "center",
    width: "90%",
    aspectRatio: 1,
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 55
  },
  previewContainerWeb: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  previewImageWeb: {
    borderRadius: 16,
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
  navigationButtonsWeb: {
    position: "relative",
    bottom: 0,
    marginTop: 16,
    gap: 16,
    padding: 0,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  nextButton: {
    width: "100%",
    marginTop: 12,
  },
  nextButtonWeb: {
    position: "relative",
    bottom: 0,
    width: "100%",
    maxWidth: 560,
    paddingRight: 0,
    marginTop: 16,
    alignSelf: "center",
  },
});
