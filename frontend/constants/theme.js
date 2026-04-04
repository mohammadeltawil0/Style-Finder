import { Platform } from "react-native";
import { DefaultTheme } from "@react-navigation/native";

const Fonts = {
  bold: Platform.select({
    ios: "Figtree-Bold",
    android: "Figtree-Bold",
    default: "Figtree-Bold",
  }),
  light: Platform.select({
    ios: "Petrona-Light",
    android: "Petrona-Light",
    default: "Petrona-Light",
  }),
  regular: Platform.select({
    ios: "Petrona-Regular",
    android: "Petrona-Regular",
    default: "Petrona-Regular",
  }),
  semiBold: Platform.select({
    ios: "Petrona-SemiBold",
    android: "Petrona-SemiBold",
    default: "Petrona-SemiBold",
  }),
};

export const theme = {
  ...DefaultTheme, 
  colors: {
    ...DefaultTheme.colors,
    background: "#EDEDE9", 
    card: "#D5BDAF",       
    border: "#B4907B",  // to be changed
    lightBrown: "#E3D5CA",
    text: "#4A3A33",
    lightText: "#7B6B63",
    tabIconDefault: "#EDEDE9",
    tabIconSelected: "#B4907B"  
  },
  fonts: Fonts, 
  sizes: {
    text: 16, //tbd
    h1: 35, //tbd
    h2: 25, //tbd
    h3: 20, //tbd
  }
};
