import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText, ThemedView } from "../../../components";

export default function ItemProperty() {
  const router = useRouter();

  // TODO: Fetch data of the outfit my the id/name whatever we decide
  // TODO: API call here something like this: just the blue print not sure how backend look like now 
  // const [outfit, setOutfit] = useState(null);
  // useEffect(() => {
  //   const fetchOutfit = async () => {
  //     setOutfit(data);
  //   };
  //   fetchOutfit();
  // }, [id]); 

  // For now console 
  const { id } = useLocalSearchParams();

  // Duplicate Dummy Data
  const outfits = [
    { id: "o1", name: "Outfit1", items: [{}, {}] },
    { id: "o2", name: "Outfit2", items: [{}] },
    { id: "o3", name: "Outfit3", items: [{}, {}] },
    { id: "o4", name: "Outfit4", items: [{}] },
    { id: "o5", name: "Outfit5", items: [{}, {}] },
    { id: "o6", name: "Outfit6", items: [{}] },
  ];
  const outfit = outfits.find(o => o.id === id);
  console.log("Clicked Outfit:", outfit);

  return (
    <ScrollView showsVerticalScrollIndicator={true}>
      <ThemedView>
        {/* Render images based on number of items */}
        {outfit?.items.map((item, index) => (
          <View key={index} style={styles.image} />
        ))}


        <View style={styles.info}>
          <ThemedText style={styles.title}>OUTFIT NAME</ThemedText>
          <ThemedText style={styles.label}>Description:</ThemedText>
          {/* TODO: have a function can be in frontend too, using the tags (color, style) of items 
            and fillter by user create a descriptions */}
          <ThemedText>lorem ipsum your figma</ThemedText>

          {/* TODO: Ask group if we have description then we dont need togs and infact the when 
            user clicks view item, that screen will have tags too */}
          <ThemedText style={styles.label}>Tags:</ThemedText>
          <View style={styles.tags}>
            <View style={styles.tag}>
              <ThemedText>tag</ThemedText>
            </View>
            <View style={styles.tag}>
              <ThemedText>tag</ThemedText>
            </View>
            <View style={styles.tag}>
              <ThemedText>tag</ThemedText>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.btn}>
              <ThemedText>View Items</ThemedText>
            </TouchableOpacity>

            {/* TODO: ASK Group do we even need this, like what insights will we give to user ...  */}
            <TouchableOpacity style={styles.btn}>
              <ThemedText>Insights</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: {
    height: 250,
    margin: 20,
    borderRadius: 14,
    backgroundColor: "#d6c6b8",
  },

  info: {
    paddingHorizontal: 20,
  },

  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },

  label: {
    marginTop: 10,
    fontWeight: "bold",
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },

  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#e2d7cd",
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  btn: {
    backgroundColor: "#e2d7cd",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});
