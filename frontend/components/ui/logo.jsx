import { createIconSetFromIcoMoon } from "@expo/vector-icons";
import { Image } from "react-native";

export const Logo = () => {
  return (
    <Image
      source={require("../../assets/images/logo.png")}
      style={{ width: 20, height: 22, paddingVertical: 10 }}
    />
  );
};
