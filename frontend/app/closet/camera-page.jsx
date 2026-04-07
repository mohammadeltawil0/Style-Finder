import { View } from "react-native";
import { Camera, ThemedText, ThemedView } from "../../components";
import { theme } from "../../constants";

export default function CameraPage({ setUri, setPage, uri }) {
  return (
    <ThemedView
      gradient={true}
      style={{ backgroundColor: theme.colors.background,  paddingVertical: 30, flex: 1 }}
    >
      <View style={{ paddingHorizontal: 30, zIndex: 1, paddingTop: 30 }}>
        <ThemedText
          style={{
            fontSize: theme.sizes.h2,
            color: theme.colors.text,
            textAlign: "center",
          }}
        >
          Take a clear photo of the item you want to add.
        </ThemedText>
      </View>
      <Camera setUri={setUri} setPage={setPage} uri={uri} />
    </ThemedView>
  );
};
