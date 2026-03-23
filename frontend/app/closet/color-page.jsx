import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText, ThemedView, TogglePreview } from "../../components";

export default function ColorPage({ setPage, color, setColor, uri }) {
  const theme = useTheme();
  return (
    <ThemedView gradient={true} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          flex: 1,
          marginBottom: 316, //TO DO: make this dynamic based on keyboard height; idk if this is actually good for all mobiles
                            // or just remove keyboard avoiding view
        }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <View
              style={styles.togglePreviewContainer}
              pointerEvents="box-none"
            >
              <TogglePreview setPage={setPage} uri={uri} />
            </View>
            <View
              className="question"
              style={{
                marginTop: !uri ? -50 : 0,
                paddingHorizontal: 30,
                paddingBottom: 30,
                zIndex: 1,
              }}
            >
              <ThemedText
                style={{
                  fontSize: theme.sizes.h1,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bold,
                }}
              >
                What kind of colors
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h1,
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bold,
                  paddingBottom: 20,
                }}
              >
                does this item have?
              </ThemedText>
            </View>
            <View
              className="subheader"
              style={{
                marginTop: !uri ? -50 : 0,
                paddingHorizontal: 30,
                paddingBottom: 30,
                zIndex: 1,
              }}
            >
              <ThemedText
                style={{
                  fontSize: theme.sizes.h3,
                  color: theme.colors.text,
                }}
              >
                select one color that best describes
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h3,
                  color: theme.colors.text,
                }}
              >
                your item
              </ThemedText>
            </View>
            <View>
              <TextInput
                value={color}
                onChange={(e) => setColor(e.nativeEvent.text)}
                placeholder="e.g. red, blue, green"
                placeholderTextColor={theme.colors.text + "99"}
                style={{
                  backgroundColor: theme.colors.lightBrown,
                  color: theme.colors.text,
                  fontSize: theme.sizes.text,
                  padding: 15,
                  borderRadius: 5,
                  width: "90%",
                  alignSelf: "center",
                }}
              />
              {/* TO DO: make it so that the input automatically chooses one of the colors that we have; like user types in a color and our input then automatically fills it */}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.navigationButtons}>
        <Pressable
          onPress={() => setPage(2)}
          //TO DO: if next is not visible, make this flex-start or figure it out
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            padding: 10,
            width: "35%",
          }}
        >
          <ThemedText style={{ textAlign: "center" }}>Back</ThemedText>
        </Pressable>
        {color && (
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: "35%",
            }}
            onPress={() => setPage(4)}
          >
            <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = {
  navigationButtons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 40,
    justifyContent: "center",
    padding: 20,
    position: "absolute",
    bottom: 10,
    width: "100%",
  },
  togglePreviewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
};
