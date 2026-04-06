import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Animated , View} from "react-native";
import { ThemedView } from "../../../components";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GeneratingScreen() {
  const router = useRouter();
  const { payload } = useLocalSearchParams();

  useEffect(() => {
    const generateOutfit = async () => {
      try {
        const saved = await AsyncStorage.getItem("pendingOutfitRequest");
        const payload = JSON.parse(saved);

        // TODO: API call here: Note const data have all the data regular outfit ask for 
        // TODO: change API URL 
        // const response = await fetch("https://api.stylefinder.tech/api/", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json"
        //   },
        //   body: JSON.stringify(payload)
        // });

        // const result = await response.json();
        // await AsyncStorage.setItem("latestOutfitResult", JSON.stringify(result));

        // Navigate to results screen with the resulting data 
        await new Promise(res => setTimeout(res, 3000)); // 2s delay
        router.replace("/screens/GenerateOutfits/DisplayOutfits");

      } catch (error) {
        console.error("Error:", error);
      }
    };

    generateOutfit();
  }, []);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 10,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const fadeAnim = useRef(new Animated.Value(0)).current; 
  useEffect(() => {
    Animated.loop( 
      Animated.sequence([ 
        Animated.timing(fadeAnim, 
          { 
            toValue: 1, 
            duration: 800, 
            useNativeDriver: true, 
          }), 
        Animated.timing(
          fadeAnim, 
          { 
            toValue: 0, 
            duration: 800, 
            useNativeDriver: true, 
          }), 
      ]) ).start(); 
    }, []);

  return (
    <ThemedView gradient={true} style={styles.container}>
       <Animated.Text style={[styles.text, { opacity: fadeAnim }]}>
          Finding styles for you...
       </Animated.Text>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: moveAnim },
              ],
            },
          ]}
        />
        <Animated.Text style={[styles.text, { opacity: fadeAnim }, {marginTop: 100} ]}>
            FINDING OUTFITS
        </Animated.Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  text: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#333", 
    textAlign: "center", 
    marginBottom: 50, 
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  circle: {
    width: 250, 
    height: 250, 
    borderRadius: 200, 
    borderWidth: 6, 
    borderColor: "#d39f44", 
    justifyContent: "center",
    alignItems: "center", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
  },
});
