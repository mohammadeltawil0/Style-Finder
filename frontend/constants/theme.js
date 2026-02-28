import { Platform } from "react-native";
import { DefaultTheme } from "@react-navigation/native";

const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const theme = {
  ...DefaultTheme, 
  colors: {
    ...DefaultTheme.colors,
    primary: "#949F71",  
    background: "#EDEDE9", 
    card: "#D5BDAF",       
    border: "#F5EBE0",  // to be changed
    lightBrown: "#E3D5CA",
    text: "#000000",
    tabIconDefault: "#EDEDE9",
    tabIconSelected: "#B4907B"  
  },
  fonts: Fonts, 
  sizes: {
    text: 16, //tbd
    h1: 24, //tbd
    h2: 20, //tbd
    h3: 18, //tbd
  }
};
