import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";

// Multilingual Support
import { I18nextProvider } from 'react-i18next';
import i18n from './locales/i18n';

import RecodingsScreen from "./screens/RecordingsScreen";
import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/Settings";
import WorldScreen from "./screens/WorldScreen";
import SearchScreen from "./screens/SearchScreen";
import ExploreScreen from "./screens/ExploreScreen";

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Drawer.Navigator>
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="Recordings" component={RecodingsScreen} />
          <Drawer.Screen name="Settings" component={SettingsScreen} />
          <Drawer.Screen name="World" component={WorldScreen} />
          <Drawer.Screen name="Search" component={SearchScreen} />
          <Drawer.Screen name="Explore" component={ExploreScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
