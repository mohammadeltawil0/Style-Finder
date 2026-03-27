import { useState } from "react";
import { View, Switch, TextInput, ScrollView, TouchableOpacity, StyleSheet , Platform, KeyboardAvoidingView, Image} from "react-native";
import { ThemedText, ThemedView } from "../../components";
import { useTheme } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function AdditionalConstraints() {
  const theme = useTheme();
  const router = useRouter();

  const { constraints } = useLocalSearchParams();
  
  let parsedConstraints = {};
    try {
      parsedConstraints =
        typeof constraints === "string"
          ? JSON.parse(constraints)
          : constraints || {};
    } catch (e) {
      parsedConstraints = {};
    }
    
  const [topFit, setTopFit] = useState(parsedConstraints.topFit || []);
  const [topLength, settopLength] = useState(parsedConstraints.topLength || []);

  const [bottomFit, setBottomFit] = useState(parsedConstraints.bottomFit || []);
  const [bottomLength, setbottomLength] = useState(parsedConstraints.bottomLength || []);

  const [fullBody, setFullBody] = useState(parsedConstraints.fullBody || false);
  const [fullBodyLength, setfullBodyLength] = useState(parsedConstraints.fullBodyLength || []);

  const [outerwear, setOuterwear] = useState(parsedConstraints.outerwear || false);
  const [outerFit, setouterFit] = useState(parsedConstraints.outerFit || []);

  const [patterns, setPatterns] = useState(parsedConstraints.patterns || false);
  const [color, setColor] = useState(parsedConstraints.color || "");

  const topAndOuterwearFitOptions = ["Skinny", "Slim", "Regular", "Relaxed", "Oversized"];
  const bottomFitOptions = ["Skinny / Bodycon", "Slim", "Straight", "Relaxed", "Baggy/Wide-Leg", "Flared / Bootcut"];

  const fullBodyLengthDefine = ["Above knee", "Knee", "Maxi/Full Length"]; 
  const topLengthDefine = ["Cap/Sleeveless", "Short Sleeve", "Elbow Sleeve", "Long Sleeve"]; 
  const bottomLengthDefine = ["Shorts", "Midi/Capri", "Bermuda", "Full-length"]; 

  const handleSave = () => {
    const constraints = {
      topFit, topLength,
      bottomFit, bottomLength,
      fullBody, fullBodyLength,
      outerwear, outerFit,
      patterns, color
    };

    router.push({
      pathname: "/(tabs)/recommendations",
      params: { constraints: JSON.stringify(constraints) }
    });
  };

  const toggleSelection = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter(item => item !== value)); // remove
    } else {
      setState([...state, value]); // add
    }
  };

  return (
    <ThemedView gradient={false} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ flexDirection: "row", width: "100%", marginTop: 10, marginLeft: 10, marginRight: 20 }}>
          <View style={{ width: "70%" }}>
            <ThemedText style={{ fontSize: theme.sizes.h2, fontFamily: theme.fonts.bold, margin: 30 }}>Continue Adding Filters!  </ThemedText>
          </View>
          <View style={{ width: "20%", alignItems: "center", justifyContent: "center" }}>
            <Image source={require("../../assets/images/logo.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={{ width:"90%" }}>

        {/* Have Full-Body */}
        <View style={styles.row}>
          <ThemedText style={styles.label}>Full Body Outfit:</ThemedText>
          <Switch value={fullBody} onValueChange={setFullBody} trackColor={{ true: "#d39f44", false: "#ccc" }} thumbColor={fullBody ? "#fff" : "#f4f3f4"} />
        </View>

          {/* if not want full body then ask for bottom and top fit (only if fullBody = false) */}
          {!fullBody && (
            <View style={{ marginTop: 20 }}>

            {/* Top fit option */}
            <ThemedText style={styles.label}>Top Fit:</ThemedText>
              <View style={styles.optionsRow}>
              {topAndOuterwearFitOptions.map(opt => (
                <ThemedText
                  key={opt}
                  onPress={() => toggleSelection(opt, topFit, setTopFit)}
                  style={[  styles.option, {  backgroundColor: topFit.includes(opt) ? "#e5d3b3" : "#f0f0f0",  borderColor: topFit.includes(opt) ? "#000" : "#ccc" } ]}
                >
                  {opt}
                </ThemedText>
              ))}
              </View>
            <ThemedText style={styles.label}>Select Top Lenght:</ThemedText>
              <View style={styles.optionsRow}>
              {topLengthDefine.map(opt => (
                <ThemedText
                  key={opt}
                  onPress={() => toggleSelection(opt, topLength, settopLength)}
                  style={[  styles.option, {  backgroundColor: topLength.includes(opt) ? "#e5d3b3" : "#f0f0f0",  borderColor: topLength.includes(opt) ? "#000" : "#ccc" } ]}
                >
                  {opt}
                </ThemedText>
              ))}
              </View>

            {/* Bottom fit option */}
              <ThemedText style={styles.label}>Bottom Fit:</ThemedText>
              <View style={styles.optionsRow}>
                {bottomFitOptions.map(opt => (
                  <ThemedText
                    key={opt}
                    onPress={() => toggleSelection(opt, bottomFit, setBottomFit)}
                    style={[
                      styles.option,
                      { backgroundColor: bottomFit.includes(opt) ? "#e5d3b3" : "#f0f0f0",  borderColor: bottomFit.includes(opt) ? "#000" : "#ccc"  }
                    ]}
                  >
                    {opt}
                  </ThemedText>
                ))}
              </View>
              <ThemedText style={styles.label}>Select Bottom Lenght:</ThemedText>
              <View style={styles.optionsRow}>
              {bottomLengthDefine.map(opt => (
                <ThemedText
                  key={opt}
                  onPress={() => toggleSelection(opt, bottomLength, setbottomLength)}
                  style={[  styles.option, {  backgroundColor: bottomLength.includes(opt) ? "#e5d3b3" : "#f0f0f0",  borderColor: bottomLength.includes(opt) ? "#000" : "#ccc" } ]}
                >
                  {opt}
                </ThemedText>
              ))}
              </View>

            </View>
          )} 
          
          {/* if fullbody then select length */}
          {fullBody && (
            <View style={{ marginTop: 20 }}>
              <ThemedText style={styles.label}>Select Lenght:</ThemedText>
              <View style={styles.optionsRow}>
              {fullBodyLengthDefine.map(opt => (
                <ThemedText
                  key={opt}
                  onPress={() => toggleSelection(opt, fullBodyLength, setfullBodyLength)}
                  style={[  styles.option, {  backgroundColor: fullBodyLength.includes(opt) ? "#e5d3b3" : "#f0f0f0",  borderColor: fullBodyLength.includes(opt) ? "#000" : "#ccc" } ]}
                >
                  {opt}
                </ThemedText>
              ))}
            </View>
            </View>
          )}

          {/* Include Outerwear */}
          <View style={styles.row}>
            <ThemedText style={styles.label}>Include Outerwear:</ThemedText>
            <Switch value={outerwear} onValueChange={setOuterwear} trackColor={{ true: "#d39f44", false: "#ccc" }} thumbColor={outerwear ? "#fff" : "#f4f3f4"} />
          </View>

          {/* if want outerwear then ask for outter wear fit */}
          {outerwear && (
            <View style={{ marginTop: 20 }}>
              {/* outter wear fit option */}
              <ThemedText style={styles.label}>Outerwear Fit:</ThemedText>
              <View style={styles.optionsRow}>
                {topAndOuterwearFitOptions.map(opt => (
                  <ThemedText
                    key={opt}
                    onPress={() => toggleSelection(opt, outerFit, setouterFit)}
                    style={[
                      styles.option, { backgroundColor: outerFit.includes(opt) ? "#e5d3b3" : "#f0f0f0",  borderColor: outerFit.includes(opt) ? "#000" : "#ccc"  }
                    ]}
                  >
                    {opt}
                  </ThemedText>
                ))}
              </View>
            </View>
          )}

          {/* Patterns */}
          <View style={styles.row}>
            <ThemedText style={styles.label}>Patterns:</ThemedText>
            <Switch value={patterns} onValueChange={setPatterns} trackColor={{ true: "#d39f44", false: "#ccc" }} thumbColor={patterns ? "#fff" : "#f4f3f4"} />
          </View>

          {/* Color its optional since survey have it. (only if patterns = false) onlt solid color */}
          {!patterns && (
            <View style={{ marginTop: 20 }}>
              <ThemedText style={styles.label}>Please Enter Closet Color:</ThemedText>
              <TextInput
                placeholder="Optional"
                value={color}
                onChangeText={setColor}
                style={styles.input}
              />
            </View>
          )}

          {/* Save & Return */}
          <TouchableOpacity onPress={handleSave} activeOpacity={0.7} style={styles.saveButton}>
            <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}>Save & Return</ThemedText>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop:10,
    fontFamily: ""
  },
  input: {
    borderWidth: 1,
    borderColor: "#cac4c4b9",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0"
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: "center"
  },
  saveButton: {
    marginTop: 40,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center"
  }
});