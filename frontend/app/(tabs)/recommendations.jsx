import { useState } from "react";
import { View, Switch, TextInput,TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,Image } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { OutfitToggle } from "../../components/outfit-toggle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useRoute } from "@react-navigation/native";

export default function Recommendations() {
  const theme = useTheme();

  // Constraints for this screen 
  const [isRegularOutfit, setIsRegularOutfit] = useState(true);
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [location, setLocation] = useState(""); 
  const [formality, setFormality] = useState(""); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [eventType, setEventType] = useState(""); 

  // constraints for additional 
  const [fit, setFit] = useState("Regular");
  const [fullBody, setFullBody] = useState(false);
  const [outerwear, setOuterwear] = useState(false);

  const formalityOptions = ["Casual", "Business Casual", "Formal"];

  // FOR NOW PREDEFINE  TO AVOID SPELLING ERROR AND ESAIER FOR WEATHER API LOOK UP
  // BUT NOT GOOD APPROACH 
  // LATER IN BACKEND HAVE GOOGLE API TO AUTO SEARCH CITY, STATE, COUNTRY - LATER 
  const predefinedLocations = [
    { city: "New York", state: "NY", country: "USA" },
    { city: "New Brunswick", state: "NJ", country: "USA" },
    { city: "Piscataway", state: "NJ", country: "USA" },
    { city: "Jersey City", state: "NJ", country: "USA" },
    { city: "Los Angeles", state: "CA", country: "USA" },
    { city: "Chicago", state: "IL", country: "USA" },
    { city: "Houston", state: "TX", country: "USA" },
    { city: "Miami", state: "FL", country: "USA" },
  ];

  const filteredLocations = predefinedLocations.filter(locate =>
    `${locate.city}, ${locate.state}, ${locate.country}`.toLowerCase().includes(location.toLowerCase())
  );

  const handleToggleOutfit = async (value) => {
    setIsRegularOutfit(value);
    await AsyncStorage.setItem("recommendationTab", value ? "regular" : "trip");
  };


  const handleAdditonalConstraints = () =>{
    console.log("To the next page"); 
  }

  const handleGenerateOutfit = () =>{
    console.log({ location, formality, eventType, fit, fullBody, outerwear, weatherEnabled });
    console.log("Generate handle here")
  }

  return (
    <ThemedView gradient={false} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <OutfitToggle isRegularOutfit={isRegularOutfit} toggleOutfit={handleToggleOutfit} />
        {/* Header  */}
        <View className="header-text"
          style={{ flexDirection: "row", gap: 10, width: "100%" }}>
          <View style={{ width: "70%" }}>
            <ThemedText style={{ fontSize: theme.sizes.h1, fontFamily: theme.fonts.bold, margin: 30}}
            >Let's find some outfits! </ThemedText>
          </View>
          <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
            <Image source={require("../../assets/images/logo.png")}
              style={{  width: 80,  height: 80 }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* location Input */}
        <View className="Location-text" style={{ flexDirection: "row",  marginTop: 40, width: "80%", marginLeft: 10 }}>
          <View >
            <ThemedText style={{ fontSize: theme.sizes.h3, marginTop:25,  fontFamily: theme.fonts.bold}}>Location: </ThemedText>
          </View>
          <View style={{ flexDirection: "column", width: "55%", marginTop: 20 }}>
           <TextInput placeholder="City, State, Country" value={location}
              onChangeText={text => {
                setLocation(text); 
                setShowDropdown(text.length > 0);
              }}
              style={styles.input}
          />
            {showDropdown && filteredLocations.length > 0 && (
              <ScrollView style={{ maxHeight: 120, borderWidth: 1, borderColor: "#ccc", borderRadius: 5 }}>
                {filteredLocations.map((locate, index) => (
                  <ThemedText key={index} style={{ padding: 8, borderBottomWidth: 1, borderColor: "#eee" }}
                    onPress={() => {
                      setLocation(`${locate.city}, ${locate.state}, ${locate.country}`);
                      setShowDropdown(false);
                    }}
                  >
                    {locate.city}, {locate.state}, {locate.country}
                  </ThemedText>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        { /* Formality Input */}
        <View style={{ marginTop: 40, width: "90%" }}>
          <ThemedText style={{ fontSize: theme.sizes.h3, marginLeft: 25, marginBottom: 20,  fontFamily: theme.fonts.bold }}>Formality:</ThemedText>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {formalityOptions.map(option => (
              <ThemedText key={option}
                onPress={() => {
                  setFormality(option);
                  if (option !== "Formal") setEventType("");
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: formality === option ? "#000" : "#ccc",
                  backgroundColor: formality === option ? "#e5d3b3" : "#f0f0f0",
                  textAlign: "center",
                }}
              >
                {option}
              </ThemedText>
            ))}
          </View>

        {/* if Formal then give input for event */}
        {formality === "Formal" && (
          <View style={{ flexDirection: "row", marginTop: 10, marginLeft: 30, width: "90%" }}>
            <View>
              <ThemedText style={{ fontSize: theme.sizes.h3, marginTop: 25,  fontFamily: theme.fonts.bold}}>Event Type: </ThemedText>
            </View>
            <View style={{ flexDirection: "column", width: "55%", marginTop: 20 }}>
              <TextInput
                placeholder="Type event"
                value={eventType}
                onChangeText={text => setEventType(text)}
                style={styles.input}
              />
            </View>
          </View>
        )}
      </View>

      {/* additional contraints */}
       <View style={{ marginTop: 40, width: "90%" }}>
        <TouchableOpacity onPress={handleAdditonalConstraints} activeOpacity={0.7} style={styles.additionalConstraints} >
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Helvetica'}}> Additional Constraints</ThemedText>
        </TouchableOpacity>
       </View>

      {/* Consider Weather  */}
      <View style={{ flexDirection: "row", width: "80%", marginTop: 30, alignItems: "center", justifyContent: "space-between", marginLeft: 25 }}>
        <ThemedText style={{ fontSize: theme.sizes.h3 }}>
          Consider Weather:
        </ThemedText>
        <Switch value={weatherEnabled} onValueChange={(value) => setWeatherEnabled(value)} trackColor={{ false: "#ccc", true: "#d39f44" }} thumbColor={weatherEnabled ? "#fff" : "#f4f3f4"} />
      </View>
       
       {/* Generate Outfit */}
       <View style={{ marginTop: 40, width: "90%" }}>
        <TouchableOpacity onPress={handleGenerateOutfit} activeOpacity={0.7} style={styles.additionalContraints} >
          <ThemedText style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Helvetica'}}> Generate Outfit </ThemedText>
        </TouchableOpacity>
       </View>

    </ScrollView>
    </KeyboardAvoidingView>
    </ThemedView>

  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#cac4c495",
    borderWidth: 1,
    padding: 7,
    borderColor: "#cac4c4b9",
  },
  additionalContraints: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 10, 
  },
});