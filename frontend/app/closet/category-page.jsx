import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { ThemedText, ThemedView, TogglePreview } from "../../components";
import { theme } from "../../constants";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export default function CategoryPage({ setPage, category, setCategory, uri }) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isWide = width >= 768;
  const buttonWidth = isWide ? 220 : "30%";

  const getOptionStyle = (selected) => ({
    backgroundColor: selected ? theme.colors.tabIconSelected : theme.colors.lightBrown,
  });

  return (
    <ThemedView gradient={true} style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isWide && styles.scrollContentWide,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.contentContainer,
            uri && styles.contentContainerWithPreview,
          ]}
        >
          <View style={styles.togglePreviewContainer} pointerEvents="box-none">
            <TogglePreview setPage={setPage} uri={uri} />
          </View>

          <View
            className="question"
            style={[
              styles.textBlock,
              !uri && styles.textBlockNoImage,
              isWide && styles.textBlockWide,
            ]}
          >
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                color: theme.colors.text,
                fontFamily: theme.fonts.bold,
              }}
            >
              What category is
            </ThemedText>
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                color: theme.colors.text,
                fontFamily: theme.fonts.bold,
                paddingBottom: 20,
              }}
            >
              this item for?
            </ThemedText>
          </View>

          <View className="categoryOptions" style={styles.categoryOptions}>
            <Pressable
              onPress={() => setCategory("Top")}
              style={[styles.optionCard, getOptionStyle(category === "Top")]}
            >
              <View className="optionTitle" style={styles.optionTitle}>
                <Ionicons name="shirt" size={24} color="black" />
                <ThemedText
                  style={{
                    fontSize: theme.sizes.h2,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Top
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: theme.sizes.text,
                  color: theme.colors.text,
                  paddingTop: 10,
                }}
              >
                T-shirts, graphic tees, you name it!
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setCategory("Bottom")}
              style={[styles.optionCard, getOptionStyle(category === "Bottom")]}
            >
              <View className="optionTitle" style={styles.optionTitle}>
                <Ionicons name="shirt" size={24} color="black" />
                <ThemedText
                  style={{
                    fontSize: theme.sizes.h2,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Bottom
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: theme.sizes.text,
                  color: theme.colors.text,
                  paddingTop: 10,
                }}
              >
                Low rise, mid rise, high rise to flared, skinny, and wide!
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setCategory("Full Body")}
              style={[styles.optionCard, getOptionStyle(category === "Full Body")]}
            >
              <View className="optionTitle" style={styles.optionTitle}>
                <FontAwesome6 name="person-dress" size={24} color="black" />
                <ThemedText
                  style={{
                    fontSize: theme.sizes.h2,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Full Body
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: theme.sizes.text,
                  color: theme.colors.text,
                  paddingTop: 10,
                }}
              >
                Jumpsuits, rompers, dresses, and all things full body!
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setCategory("Outerwear")}
              style={[styles.optionCard, getOptionStyle(category === "Outerwear")]}
            >
              <View className="optionTitle" style={styles.optionTitle}>
                <MaterialIcons name="checkroom" size={30} color="black" />

                <ThemedText
                  style={{
                    fontSize: theme.sizes.h2,
                    color: theme.colors.text,
                    fontFamily: theme.fonts.bold,
                  }}
                >
                  Outerwear
                </ThemedText>
              </View>
              <ThemedText
                style={{
                  fontSize: theme.sizes.text,
                  color: theme.colors.text,
                  paddingTop: 10,
                }}
              >
                Jackets, coats, blazers, and all things outerwear!
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.navigationButtons,
          isWeb && styles.navigationButtonsWeb,
          !category && styles.navigationButtonsSingle,
        ]}
      >
        <Pressable
          onPress={() => setPage(1)}
          style={{
            backgroundColor: theme.colors.card,
            borderRadius: 10,
            padding: 10,
            width: buttonWidth,
          }}
        >
          <ThemedText style={{ textAlign: "center" }}>Back</ThemedText>
        </Pressable>
        {category && (
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: buttonWidth,
            }}
            onPress={() => setPage(3)}
          >
            <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  scrollContentWide: {
    alignItems: "center",
  },
  contentContainer: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    justifyContent: "center",
    gap: 8,
    position: "relative",
  },
  contentContainerWithPreview: {
    paddingTop: 90,
  },
  textBlock: {
    paddingBottom: 20,
    zIndex: 1,
  },
  textBlockNoImage: {
    marginTop: 8,
  },
  textBlockWide: {
    paddingHorizontal: 0,
  },
  categoryOptions: {
    alignItems: "center",
    gap: 18,
    paddingBottom: 20,
    width: "100%",
  },
  optionCard: {
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    elevation: 5,
    width: "100%",
  },
  optionTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  navigationButtons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 40,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 30,
    width: "100%",
    flexWrap: "wrap",
  },
  navigationButtonsWeb: {
    paddingBottom: 28,
    marginLeft: 10
  },
  navigationButtonsSingle: {
    justifyContent: "center",
  },
  togglePreviewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
});
