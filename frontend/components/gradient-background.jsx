import { LinearGradient } from "expo-linear-gradient";

export const GradientBackground = ({ children, style }) => {
  return (
    <LinearGradient
      colors={[
        "#E7E4CD",
        "#D3DBB5",
        "#D9D2A9",
        "#CCD5AE",
        "#D3DBB5",
        "#E7E4CD",
      ]}
      locations={[0.0321, 0.1656, 0.3838, 0.625, 0.7228, 0.8205]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={{ ...style, height: "100%" }}
    >
      {children}
    </LinearGradient>
  );
};
