import { View, Platform ,Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { ThemedText, ThemedView } from "../../components";

export default function OutfitResult() {

  const router = useRouter();

  const [outfits, setOutfits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {

    const loadOutfits = async () => {
      const saved = await AsyncStorage.getItem("latestOutfitResult");

      if (saved) {
        const parsed = JSON.parse(saved);

        // assume backend returns array
        setOutfits(parsed.outfits || parsed || []);
      } else {
        // default 3 placeholders or array len
        setOutfits([{}, {}, {}]);
      }
    };

    loadOutfits();

  }, []);

  const nextOutfit = () => {
    if (currentIndex < outfits.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevOutfit = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <ThemedView gradient={true} style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={{ width:"80%" , margin: 20}}>
                {/* Header */}
                <Text style={styles.title}>Found outfits for you!</Text>

                {/* Outfit View */}
                <View style={styles.viewerContainer}>
                    {/* Left Arrow */}
                    <TouchableOpacity onPress={prevOutfit}>
                    <AntDesign name="left" size={24} />
                    </TouchableOpacity>

                    {/* Outfit Card */}
                    <View style={styles.outfitCard}>

                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeBtn}>
                        <AntDesign name="close" size={18} />
                    </TouchableOpacity>

                    {/* Edit Button */}
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push("/screens/EditOutfit")}
                    >
                        <Feather name="edit-2" size={18} />
                    </TouchableOpacity>

                    {/* Placeholder Image */}
                    <Image
                        source={require("../../assets/images/placeholder.png")}
                        style={styles.image}
                    />

                    </View>

                    {/* Right Arrow */}
                    <TouchableOpacity onPress={nextOutfit}>
                    <AntDesign name="right" size={24} />
                    </TouchableOpacity>

                </View>

                {/* Outfit Indicators */}
                <View style={styles.indicatorRow}>
                    {outfits.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                        styles.indicator,
                        index === currentIndex && styles.activeIndicator
                        ]}
                        onPress={() => setCurrentIndex(index)}
                    />
                    ))}
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveBtn}>
                    <Text style={styles.saveText}>Save All Outfits</Text>
                </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({

  title: {
    marginTop:50,
    marginLeft:35,
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20,
    alignItems: "center",
  },

  viewerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },

  outfitCard: {
    width: 250,
    height: 400,
    backgroundColor: "#dcdcdc",
    borderRadius: 12,
    marginHorizontal: 20,
    justifyContent: "center",
    alignItems: "center"
  },

  image: {
    width: 200,
    height: 350,
    resizeMode: "contain"
  },

  closeBtn: {
    position: "absolute",
    top: 10,
    left: 10
  },

  editBtn: {
    position: "absolute",
    top: 10,
    right: 10
  },

  indicatorRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20
  },

  indicator: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#ddd",
    marginHorizontal: 6
  },

  activeIndicator: {
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#cfcfcf"
  },

  saveBtn: {
    marginTop: 20,
    alignSelf: "center",
    backgroundColor: "#cfcfcf",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8
  },

  saveText: {
    fontWeight: "bold"
  }

});