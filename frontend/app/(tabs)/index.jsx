import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function HomeScreen() {
  // TO DO: fetch data for unworn items from backend; for now using mock data to test the UI
  const [unwornItems, setUnwornItems] = useState([
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
    { id: '4', name: 'Item 4' }
  ]);

  const theme = useTheme();
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  const handleNavigate = (target) => {
    router.push({
      pathname: "/closet",
      params: { tab: target }
    });
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
      <ThemedView
        gradient={false}
        style={{ flex: 1, gap: 50, justifyContent: "center", paddingHorizontal: 30 }}
      >
        <View className="header-text"
          style={{ flexDirection: "row", gap: 10, width: "100%" }}>
          <View style={{ width: "70%" }}>
            <ThemedText
              style={{
                fontSize: theme.sizes.h1,
                fontFamily: theme.fonts.bold,
              }}
            >Hello, {username}! </ThemedText>
          </View>
          <View style={{ width: "30%" }}>
            {/* TO DO: add logo here or some other thing? */}
          </View>
        </View>
        <View
          className="not-worn-items"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            height: 150,
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingVertical: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 3.5,
            elevation: 5
          }}
        >
          <ThemedText
            style={{
              fontSize: theme.sizes.h3,
              textAlign: "left"
            }}
          >
            You haven't worn these in a while
          </ThemedText>
          <View style={{ justifyContent: "center", flexDirection: 'row', gap: 10 }}>
            {unwornItems.map((item) => (
              <Pressable key={item.id}
                style={{
                  backgroundColor: theme.colors.lightBrown,
                  borderRadius: 10,
                  height: 70,
                  width: "22%",
                }}
                onPress={() => console.log("pressed item", item.name)} // TO DO: link this to item details page
              >
              </Pressable>
            ))}
          </View>
        </View>
        <View
          className="past-outfits"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingVertical: 20,
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 3.5,
            elevation: 5
          }}
        >
          <ThemedText
            style={{
              fontSize: theme.sizes.h3,
            }}
          >
            Look at past outfits
          </ThemedText>
          <AntDesign name="right" size={24} color={theme.colors.card}
            onPress={() => handleNavigate("outfits")}
          // TO DO: create logic where if user has no past outfits vs a grid of past outfits!
          />
        </View>
        <View
          className="manage-closet"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            paddingHorizontal: 20,
            paddingVertical: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 3.5,
            elevation: 5
          }}
        >
          <ThemedText
            style={{
              fontSize: theme.sizes.h3,
            }}
          >
            Manage your closet
          </ThemedText>
          <View
            className="manage-closet-options"
            style={{
              flexDirection: "row",
              gap: 20,
              justifyContent: "space-between",
              marginTop: 20
            }}>
            <Pressable
              onPress={() => handleNavigate("items")}
              style={{
                backgroundColor: theme.colors.lightBrown,
                borderRadius: 10,
                paddingVertical: 10,
                width: "45%"
              }}>
              <ThemedText style={{ color: theme.colors.text, textAlign: "center" }}>Items</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => handleNavigate("outfits")}
              style={{
                backgroundColor: theme.colors.lightBrown,
                borderRadius: 10,
                paddingVertical: 10,
                width: "45%"
              }}>
              <ThemedText style={{ color: theme.colors.text, textAlign: "center" }}>Outfits</ThemedText>
            </Pressable>
          </View>
        </View>
      </ThemedView>
    </ScrollView>

  );
}
