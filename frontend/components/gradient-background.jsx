import { LinearGradient } from "expo-linear-gradient";

export const GradientBackground = ({ children, style }) => {
  return (
    <LinearGradient
      colors={[
        "#EDEDE9",
        "#D6CCC2",
        "#E3D5CA",
        "#D5BDAF",
        "#B49480",
      ]}
      locations={[0, 0.2452, 0.4952, 0.7596, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{ ...style, flex: 1 }}
    >
      {children}
    </LinearGradient>
  );
};
