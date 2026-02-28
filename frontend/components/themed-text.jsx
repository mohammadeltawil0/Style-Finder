import { StyleSheet, Text } from "react-native";
import { useTheme } from '@react-navigation/native';

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}) {

  const theme = useTheme();
  const fontFamily = theme.fonts ? theme.fonts.sans : 'System';
  
  return (
    <Text
      style={[
        { fontFamily, color: theme.colors.text },
        styles[type],
        style
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
