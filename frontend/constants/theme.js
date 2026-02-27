import { Platform } from "react-native";
import { DefaultTheme } from "@react-navigation/native";

export const theme = {
  ...DefaultTheme, 
  colors: {
    ...DefaultTheme.colors,
    primary: "#949F71",  
    background: "#E9EDC9", 
    card: "#CCD5AE",       
    text: "#000000",     
    border: "#949F71",  // to be changed
    text: "#000000",
    tabIconDefault: "#FEFAE0",
    tabIconSelected: "#949F71"
  },
  sizes: {
    padding: 16, //tbd
    textSize: 14, //tbd
    h1Size: 24, //tbd
    h2Size: 20, //tbd
    h3Size: 18, //tbd
  }
};


export const Fonts = Platform.select({
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
