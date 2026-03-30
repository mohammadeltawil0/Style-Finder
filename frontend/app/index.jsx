import { Redirect } from "expo-router";

export default function Index() {
  // return <Redirect href="/auth/logIn" />;
  // return <Redirect href="/screens/AdditionalConstraints" />; // to test additional paramenters 
  // return <Redirect href="/(tabs)/recommendations" />; //is test recommendations UI
  // return <Redirect href="/screens/OutfitswaitingScreen" />; //ito test waiting screen 
  return <Redirect href="/screens/DisplayOutfits" />; //is test display screen 

}