import { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedView, ThemedText } from "../../components";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function EditOutfit() {

//   const router = useRouter();
//   const { outfit } = useLocalSearchParams();

//   const parsed = JSON.parse(outfit);

  const [top, setTop] = useState("Top Click to Edit");
  const [bottom, setBottom] = useState("Bottom Click to Edit");
//   const [shoes, setShoes] = useState(parsed.shoes);
//   const [outerwear, setOuterwear] = useState(parsed.outerwear);

  const handleSave = () => {

    // router.push({
    //   pathname:"/screens/outfitResult",
    //   params:{
    //     updatedOutfit: JSON.stringify(updated)
    //   }
    // });

    console.log("saved ")
  };

  return (
    <ThemedView style={{flex:1}}>

      <View style={styles.container}>

        <ThemedText style={styles.title}>
          Edit Outfit
        </ThemedText>

        <TextInput
          style={styles.input}
          value={top}
          onChangeText={setTop}
          placeholder="Top"
        />

        <TextInput
          style={styles.input}
          value={bottom}
          onChangeText={setBottom}
          placeholder="Bottom"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={{fontWeight:"bold"}}>
            Save Changes
          </ThemedText>
        </TouchableOpacity>

      </View>

    </ThemedView>
  );
}

const styles = StyleSheet.create({

  container:{
    padding:30
  },

  title:{
    fontSize:24,
    fontWeight:"bold",
    marginBottom:20
  },

  input:{
    borderWidth:1,
    borderColor:"#ccc",
    borderRadius:10,
    padding:10,
    marginBottom:15
  },

  saveButton:{
    borderWidth:2,
    borderColor:"#ccc",
    borderRadius:12,
    paddingVertical:12,
    alignItems:"center",
    marginTop:10
  }

});
