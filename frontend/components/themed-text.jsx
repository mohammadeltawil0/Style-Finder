import { useTheme } from "@react-navigation/native";
import { Text } from "react-native";

export const ThemedText = ({ style, type = 'regular', ...props }) => {
  const theme = useTheme();
  
  // Use a fallback font in case the theme hasn't loaded properly yet
  const fontFamily = theme.fonts ? theme.fonts[type] : 'System';

  return (
    <Text
      style={[{ 
        fontFamily: fontFamily, 
        fontSize: theme.sizes?.text || 16, // Using your custom sizes
        color: theme.colors.text 
      }, style]}
      {...props}
    />
  );
};