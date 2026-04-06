import { useState } from "react";
import { View, Switch, TextInput,TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,Image, Alert } from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { OutfitToggle } from "../../components/outfit-toggle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function Recommendations() {
  const theme = useTheme();
  const router = useRouter();

  // Constraints for this screen 
  const [isRegularOutfit, setIsRegularOutfit] = useState(true);
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [location, setLocation] = useState(""); 
  const [formality, setFormality] = useState(""); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [eventType, setEventType] = useState(""); 

  // more constraints for additional constraints 
  const [topFit, setTopFit] = useState([]);
  const [topLength, setTopLength] = useState([]);
  const [bottomFit, setBottomFit] = useState([]);
  const [bottomLength, setBottomLength] = useState([]);
  const [fullBody, setFullBody] = useState(false);
  const [fullBodyLength, setFullBodyLength] = useState([]);
  const [outerwear, setOuterwear] = useState(false);
  const [outerFit, setOuterFit] = useState([]);
  const [patterns, setPatterns] = useState(false);
  const [color, setColor] = useState("");
  const [extraConstraints, setConstraints] = useState(null);

  // Gets data for additional contranits 
  useFocusEffect(
    React.useCallback(() => {
      const loadSavedConstraints = async () => {
        const saved = await AsyncStorage.getItem("recommendationConstraints");
        if (saved) {
          const parsed = JSON.parse(saved);

          // Back to Previous State 
          setLocation(parsed.location || "");
          setFormality(parsed.formality || "");
          setEventType(parsed.eventType || "");
          setWeatherEnabled(parsed.weatherEnabled === true || parsed.weatherEnabled === "true");
          setConstraints(parsed);

          // Update additonal contriants 
          setTopFit(parsed.topFit || []);
          setTopLength(parsed.topLength || []);
          setBottomFit(parsed.bottomFit || []);
          setBottomLength(parsed.bottomLength || []);
          setFullBody(parsed.fullBody || false);
          setFullBodyLength(parsed.fullBodyLength || []);
          setOuterwear(parsed.outerwear || false);
          setOuterFit(parsed.outerFit || []);
          setPatterns(parsed.patterns || false);
          setColor(parsed.color || "");
        }
      };
      loadSavedConstraints();
    }, [])
  );

  // Define 3 formailiy thats it. Avoid spelling
  const formalityOptions = ["Casual", "Business Casual", "Formal"];
  
  // Pre-Define Location 
  /*
    TODO: Note will/and have to change based off how we will utlites weather API. 
    If we want city, state, country may we free API to fetch, 
      but i am affriad we may miss few and with DB and Stuff would be nightware 

    else we just asssume our user knows how to spell 

    ASK GROUP, but for beta we can just have this 
  */
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
  // Helper to filter list ;}
  const filteredLocations = predefinedLocations.filter(locate =>
    `${locate.city}, ${locate.state}, ${locate.country}`.toLowerCase().includes(location.toLowerCase())
  );

  // Outfit toogle : Regular or Trip 
  const handleToggleOutfit = async (value) => {
    setIsRegularOutfit(value);
    await AsyncStorage.setItem("recommendationTab", value ? "regular" : "trip");
  };

  // Call when additional constriants is click send current state of data 
  const handleAdditionalConstraints = () => {
    router.push({
      pathname: "/screens/AdditionalConstraints", 
      params: {
        constraints: JSON.stringify(extraConstraints || {}),
        location,
        formality,
        eventType,
        weatherEnabled
      }
    });
  };

  /*
    Also: location have city, state, country - agian whatever weather API use will have to change or using 
      text sepreation by comma can we use before sending json backend. 
    
      formality , eventType, color  -  text
      topFit, topLength, bottomFit, bottomLength, fullBodyLength , outerFit - array of text []
      weatherEnabled, outerwear, patterns

      I had to change the API call to different screen which is in OutfitswaitingScreen, to maintain the flow input -> wait -> result 
  */
  const handleGenerateOutfit = async () =>{
    if(!location || !formality){
       Alert.alert("Location and Formality are required input");
       return; 
    }

    console.log("Generate handle here") 
    const data = {
      location, formality,
      eventType, weatherEnabled, 
      topFit, topLength, bottomFit, 
      bottomLength, fullBody,fullBodyLength,outerwear, outerFit, patterns,color
    };
    console.log("Generate outfit with:", data);
    resetAllConstraints();

    await AsyncStorage.setItem("pendingOutfitRequest", JSON.stringify(data));
    router.push("/screens/GenerateOutfits/OutfitswaitingScreen");
  };

  const resetAllConstraints = async () => {
    await AsyncStorage.removeItem("recommendationConstraints");

    setLocation("");
    setFormality("");
    setEventType("");
    setWeatherEnabled(true);
    setIsRegularOutfit(true);
  };

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
                  <View style={styles.InputView}>
                    <TextInput placeholder="City, State, Country" value={location}
                      onChangeText={text => {
                        setLocation(text); 
                        setShowDropdown(text.length > 0);
                      }}
                      style={[styles.input, {width: "150%"}]}
                    />
                    {showDropdown && filteredLocations.length > 0 && (
                      <ScrollView style={styles.fillterList}>
                        {filteredLocations.map((locate, index) => (
                          <ThemedText key={index} style={{ padding: 8, borderBottomWidth: 1, borderColor: "#eee" }}
                            onPress={() => {  setLocation(`${locate.city}, ${locate.state}, ${locate.country}`); setShowDropdown(false); }}
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
                          paddingVertical: 8, paddingHorizontal: 15,
                          borderRadius: 8, borderWidth: 1,
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
                      <View style={styles.InputView}>
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
  fillterList: {
    maxHeight: 120, 
    borderWidth: 1, 
    borderColor: "#ccc",
    borderRadius: 5, 
    width: "150%" 
  }, 
  InputView: { flexDirection: "column", width: "55%", marginTop: 20 }
});
