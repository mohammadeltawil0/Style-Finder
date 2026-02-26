import { View } from "react-native";
import { GradientBackground } from "./gradient-background";

export function ThemedView({ style, gradient, ...otherProps }) {

  return (
    gradient ? <GradientBackground {...otherProps} style={style} /> : <View style={[{ backgroundColor: "#E9EDC9" }, style]} {...otherProps} />
  );
}
