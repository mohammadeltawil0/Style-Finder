import { Tabs } from "expo-router";

import { HapticTab } from "../../components";
import { IconSymbol} from "../../components/ui";
import { theme } from "../../constants";

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
         <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ focused }) => <IconSymbol size={28} name="briefcase.fill" color={focused ? theme.colors.tabIconSelected : theme.colors.tabIconDefault} 
 />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <IconSymbol size={28} name="house.fill" color={focused ? theme.colors.tabIconSelected : theme.colors.tabIconDefault} />,
        }}
      />
      <Tabs.Screen
        name="recommendations"
        options={{
          title: 'Recommendations',
          tabBarIcon: ({ focused }) => <IconSymbol size={28} name="paperplane.fill" color={focused ? theme.colors.tabIconSelected : theme.colors.tabIconDefault} />,
        }}
      />
    </Tabs>
  );
}
