import { View } from "react-native";

export function ThemedView({ style, lightColor, darkColor, ...otherProps }) {

  return <View style={[{ backgroundColor: "#E9EDC9" }, style]} {...otherProps} />;
}
