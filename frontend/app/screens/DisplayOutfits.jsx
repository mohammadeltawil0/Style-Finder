import { View, Platform ,Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { ThemedText, ThemedView } from "../../components";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

export default function OutfitResult() {

  const router = useRouter();
  const [outfits, setOutfits] = useState([]);
  // access the currently displayed outfit. 
  const currentOutfit = outfits[currentIndex];
  const [currentIndex, setCurrentIndex] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const loadOutfits = async () => {
        const saved = await AsyncStorage.getItem("latestOutfitResult");
        if (saved) {
          const parsed = JSON.parse(saved);
          setOutfits(parsed.outfits || parsed || []);
        }
      };
      loadOutfits();
    }, [])
  );

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

    // TODO: API call to save outfit 
    const saveSingleOutfit = async (outfit) => {
      try {
        console.log("Saving outfit:", outfit);
        // API call, input paramenter may change based on backend sent to fronted in for display 
        /*
        await .post("/outfits/save", {
        
        });
        */
        alert("Outfit saved!");
      } catch (err) {
        console.log(err);
      }
    };

    const removeOutfit = async (index) => {
      const updated = outfits.filter((_, i) => i !== index);
      setOutfits(updated);
      await AsyncStorage.setItem(
        "latestOutfitResult",
        JSON.stringify({ outfits: updated })
      );
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
                      <TouchableOpacity style={styles.closeBtn} onPress={() => removeOutfit(currentIndex)} >
                          <AntDesign name="close" size={18} />
                      </TouchableOpacity>

                      {/* Edit */}
                      <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() =>
                            router.push({
                              pathname: "/screens/EditOutfit",
                              params: { index: currentIndex }
                            })
                          }
                      >
                          <Feather name="edit-2" size={18} />
                      </TouchableOpacity>

                      {/* Placeholder Image */}
                      <Image
                          source={require("../../assets/images/placeholder.png")}
                          style={styles.image}
                      />
                      {/* THIS IS JUST THE UI, TODO: CHANGE BASED ON HOW BACKEND SENDS DATA
                          JUST TO SHOW BLOCK FOR EACH ITEM
                      */}
                      <View style={styles.piecesContainer}>
                        {outfits[currentIndex]?.outerwear && (
                          <View style={styles.pieceBox}>
                            <Text style={styles.pieceText}>
                              {outfits[currentIndex].outerwear}
                            </Text>
                          </View>
                        )}

                        {outfits[currentIndex]?.top && (
                          <View style={styles.pieceBox}>
                            <Text style={styles.pieceText}>
                              {outfits[currentIndex].top}
                            </Text>
                          </View>
                        )}

                        {outfits[currentIndex]?.bottom && (
                          <View style={styles.pieceBox}>
                            <Text style={styles.pieceText}>
                              {outfits[currentIndex].bottom}
                            </Text>
                          </View>
                        )}

                        {outfits[currentIndex]?.fullBody && (
                          <View style={styles.pieceBox}>
                            <Text style={styles.pieceText}>
                              {outfits[currentIndex].fullBody}
                            </Text>
                          </View>
                        )}
                      </View>
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
                <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={() => saveSingleOutfit(currentOutfit)}
                >
                    <Text style={styles.saveText}>Save Outfit</Text>
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
  },
  piecesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
    gap: 6
  },

  pieceBox: {
    backgroundColor: "#d02323",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },

  pieceText: {
    fontSize: 12,
    fontWeight: "500"
  },

});