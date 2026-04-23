import { Image, Pressable } from "react-native";
import { useRouter } from "expo-router";

export const Logo = () => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        router.push("/settings/Profile");
      }}
    >
      <Image
        source={require("../../assets/images/custom-logo.png")}
        style={{ width: 20, height: 22 }}
        resizeMode="contain"
      />
    </Pressable>
  );
};
