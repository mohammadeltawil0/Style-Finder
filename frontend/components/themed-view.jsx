import { View } from "react-native";
import { GradientBackground } from "./gradient-background";
import { useTheme } from "@react-navigation/native";

export function ThemedView({ style, gradient, ...otherProps }) {
  const theme = useTheme();
  return (
    gradient ? <GradientBackground {...otherProps} style={style} /> : <View style={[{ backgroundColor: theme.colors.background }, style]} {...otherProps} />
  );
}
