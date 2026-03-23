import { View, Pressable } from "react-native";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { ThemedText, ThemedView, TogglePreview } from "../../components";
import { theme } from "../../constants";
    
export default function CategoryPage({ setPage, category, setCategory, uri }) {
  return (
    <ThemedView
      gradient={true}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
      }}
    >
      <View style={styles.togglePreviewContainer} pointerEvents="box-none">
        <TogglePreview setPage={setPage} uri={uri} />
      </View>

      <View
        className="question"
        style={{
          marginTop: !uri ? -50 : 0,
          paddingHorizontal: 30,
          paddingBottom: 30,
          zIndex: 1,
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

      <View
        className="categoryOptions"
        style={{
          alignItems: "center",
          flexDirection: "column",
          gap: 50,
          paddingHorizontal: 30,
          paddingBottom: 20,
          width: "100%",
        }}
      >
        <Pressable
          onPress={() => setCategory("Top")}
          style={{
            backgroundColor:
              category === "Top"
                ? theme.colors.tabIconSelected
                : theme.colors.lightBrown,
            borderRadius: 10,
            paddingHorizontal: 30,
            paddingVertical: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 3.5,
            elevation: 5,
            width: "100%",
          }}
        >
          <View
            className="optionTitle"
            style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
          >
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
          style={{
            backgroundColor:
              category === "Bottom"
                ? theme.colors.tabIconSelected
                : theme.colors.lightBrown,
            borderRadius: 10,
            paddingHorizontal: 30,
            paddingVertical: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 3.5,
            elevation: 5,
            width: "100%",
          }}
        >
          <View
            className="optionTitle"
            style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
          >
            {/* TO DO: find a bottoms logo */}
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
          style={{
            backgroundColor:
              category === "Full Body"
                ? theme.colors.tabIconSelected
                : theme.colors.lightBrown,
            borderRadius: 10,
            paddingHorizontal: 30,
            paddingVertical: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 3.5,
            elevation: 5,
            width: "100%",
          }}
        >
          <View
            className="optionTitle"
            style={{ alignItems: "center", flexDirection: "row", gap: 10 }}
          >
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
      </View>

      <View style={styles.navigationButtons}>
        <Pressable
          onPress={() => setPage(1)}
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
        {category && (
          <Pressable
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 10,
              width: "35%",
            }}
            onPress={() => setPage(3)}
          >
            <ThemedText style={{ textAlign: "center" }}>Next</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
};


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
  Overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    backgroundColor: "rgba(0,0,0,0.25)",
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
