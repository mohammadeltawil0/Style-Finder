import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/auth/logIn" />;
  // return <Redirect href="/screens/AdditionalConstraints" />; to test additional paramenters 
  // return <Redirect href="/(tabs)/recommendations" />; to test main recommendation UI
}
