import { Tabs } from "expo-router";

import { HapticTab } from "../../components";
import { IconSymbol } from "../../components/ui";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from "../../constants";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="inventory"
        options={{
          // title: 'Inventory',
          tabBarIcon: ({ focused }) => (
            <FontAwesome6
              size={20}
              name="shirt"
              color={
                focused
                  ? theme.colors.tabIconSelected
                  : theme.colors.tabIconDefault
              }
            />
          ),
          tabBarIconStyle: {
            marginTop: 5, // Adjust this value to center it vertically
          },
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={
                focused
                  ? theme.colors.tabIconSelected
                  : theme.colors.tabIconDefault
              }
            />
          ),
          tabBarIconStyle: {
            marginTop: 5, // Adjust this value to center it vertically
          },
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          title: "Recommendations",
          tabBarIcon: ({ focused }) => (
            <Ionicons name="sparkles-sharp" size={24} color={
                focused
                  ? theme.colors.tabIconSelected
                  : theme.colors.tabIconDefault
              } />
          ),
          tabBarIconStyle: {
            marginTop: 5,
          },
          tabBarShowLabel: false,
        }}
      />
    </Tabs>
  );
}
