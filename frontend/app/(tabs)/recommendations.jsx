import { useState } from "react";
import { View, Switch, TextInput,TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,Image } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { OutfitToggle } from "../../components/outfit-toggle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useRoute , useFocusEffect} from "@react-navigation/native";

export default function Recommendations() {
  const theme = useTheme();
  const route = useRoute();


  // Constraints for this screen 
  const [isRegularOutfit, setIsRegularOutfit] = useState(true);
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [location, setLocation] = useState(""); 
  const [formality, setFormality] = useState(""); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [eventType, setEventType] = useState(""); 

  // constraints for additional 
  const [topFit, settopFit] = useState("Regular");
  const [fullBody, setFullBody] = useState(false);
  const [outerwear, setOuterwear] = useState(false);

  const [bottomFit, setBottomFit] = useState("");
  
  const [length, setLength] = useState("");
  const [color, setColor] = useState("");
  const [patterns, setPatterns] = useState(false);

  const formalityOptions = ["Casual", "Business Casual", "Formal"];

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

  const handleAdditionalConstraints = () =>{
    console.log("To the next page"); 
    
  };

  const handleGenerateOutfit = () =>{
    console.log("Generate handle here")
    const data = {
      location,
      formality,
      eventType,
      topFit,
      bottomFit,
      fullBody,
      outerwear,
      weatherEnabled,
      length,
      patterns,
      color: patterns ? "" : color
    };
    console.log("Generate outfit with:", data);
  };

  useEffect(() => {
    if (route.params?.additionalConstraints) {
      const ac = route.params.additionalConstraints;
      setFullBody(ac.fullBody ?? fullBody);
      setOuterwear(ac.outerwear ?? outerwear);
      setFit(ac.topFit ?? fit);
      setBottomFit(ac.bottomFit ?? bottomFit); // you need to create this state
      setLength(ac.length ?? length);
      setColor(ac.color ?? color);
      setPatterns(ac.patterns ?? patterns);
    }
  }, [route.params?.additionalConstraints]);

  return (
    <ThemedView gradient={false} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        
          {/* Button toggle for Regular Outfit + Trip Outfit */}
          <OutfitToggle isRegularOutfit={isRegularOutfit} toggleOutfit={handleToggleOutfit} />
          
          {/* Header */}
          <View style={{ flexDirection: "row", width: "100%", marginTop: 10, marginLeft: 20, marginRight: 20 }}>
            <View style={{ width: "70%" }}>
              <ThemedText style={{ fontSize: theme.sizes.h1, fontFamily: theme.fonts.bold, margin: 30 }}>
                Let's find some outfits! 
              </ThemedText>
            </View>
            <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
              <Image source={require("../../assets/images/logo.png")}
                style={{ width: 80, height: 80 }}
                resizeMode="cover"
              />
            </View>
          </View>

          <View style={{ width:"80%" }}>
            {isRegularOutfit ? (
              <View>
                {/* location Input */}
                <View style={{ flexDirection: "row", marginTop: 10, width: "80%" }}>
                  <View>
                    <ThemedText style={{ fontSize: theme.sizes.h3, marginTop:25, fontFamily: theme.fonts.bold }}>Location: </ThemedText>
                  </View>
                  <View style={{ flexDirection: "column", width: "55%", marginTop: 20 }}>
                    <TextInput placeholder="City, State, Country" value={location}
                      onChangeText={text => {
                        setLocation(text); 
                        setShowDropdown(text.length > 0);
                      }}
                      style={[styles.input, {width: "150%"}]}
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

                {/* Formality Input */}
                <View style={{ marginTop: 40, width: "90%" }}>
                  <ThemedText style={{ fontSize: theme.sizes.h3, marginBottom: 20, fontFamily: theme.fonts.bold }}>Formality:</ThemedText>
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
                        <ThemedText style={{ fontSize: theme.sizes.h3, marginTop: 25, fontFamily: theme.fonts.bold }}>Event Type: </ThemedText>
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

                {/* additional constraints */}
                <View style={{ marginTop: 40, width: "90%" }}>
                  <TouchableOpacity onPress={handleAdditionalConstraints} activeOpacity={0.7} style={styles.additionalContraints} >
                    <ThemedText style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Helvetica'}}> Additional Constraints </ThemedText>
                  </TouchableOpacity>
                </View>

                {/* Consider Weather */}
                <View style={{ flexDirection: "row", width: "80%", marginTop: 30, alignItems: "center", justifyContent: "space-between", marginLeft: 25 }}>
                  <ThemedText style={{ fontSize: theme.sizes.h3 }}>Consider Weather:</ThemedText>
                  <Switch value={weatherEnabled} onValueChange={(value) => setWeatherEnabled(value)} trackColor={{ false: "#ccc", true: "#d39f44" }} thumbColor={weatherEnabled ? "#fff" : "#f4f3f4"} />
                </View>
                
                {/* Generate Outfit */}
                <View style={{ marginTop: 40, width: "90%" }}>
                  <TouchableOpacity onPress={handleGenerateOutfit} activeOpacity={0.7} style={styles.additionalContraints} >
                    <ThemedText style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Helvetica'}}> Generate Outfit </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
               <View>
                <ThemedText> Welcome Trip Planning Outfits </ThemedText>
              </View>
            )}
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