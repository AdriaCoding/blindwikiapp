import React, { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useNavigation } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View, StyleSheet, BackHandler } from "react-native";

import Colors from "@/constants/Colors";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { handleExitApp } from "./exit";
// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Add back handler to show exit confirmation when pressing back on the root screen
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Check if we're at the root screen
      if (!navigation.canGoBack()) {
        return handleExitApp(t);
      }
      // Otherwise, let the default back behavior happen
      return false;
    });

    return () => backHandler.remove();
  }, [navigation]);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabBar.inactive,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        headerStyle: {
          backgroundColor: Colors.light.topBannerBackground,
        },
        headerTintColor: Colors.light.topBannerText,
        sceneStyle: {
          backgroundColor: Colors.light.background,
        },
        // Colocar texto debajo de los iconos
        tabBarLabelPosition: 'below-icon',
        // Custom header to show tab title on left and app name on right
        headerTitle: () => {
          // Get the title based on the route name
          let title = '';
          if (route.name === 'index') title = t('home.title');
          else if (route.name === 'myMessages') title = t('myMessages.title');
          else if (route.name === 'explore') title = t('explore.title');
          else if (route.name === 'world') title = t('world.title');
          else if (route.name === 'search') title = t('search.title');
          else if (route.name === 'settings') title = t('settings.title');
          else if (route.name === 'exit') title = t('exit.title');
          
          return (
            <View style={styles.headerContainer}>
              <Text style={styles.headerLeftText}>{title}</Text>
              <Text style={styles.headerRightText}>Blind Wiki 2.0</Text>
            </View>
          );
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t('home.tabLabel'),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myMessages"
        options={{
          tabBarLabel: t('myMessages.tabLabel'),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="file-audio-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="map-marker" color={color} />,
          tabBarLabel: t('explore.tabLabel'),
        }}
      />
      <Tabs.Screen
        name="world"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="globe" color={color} />,
          tabBarLabel: t('world.tabLabel'),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          tabBarLabel: t('search.tabLabel'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="sliders" color={color} />
          ),
          tabBarLabel: t('settings.tabLabel'),
        }}
      />
      {/* Exit tab - doesn't navigate to a screen */}
      <Tabs.Screen
        name="exit"
        listeners={{
          tabPress: (e) => {
            // Prevent default navigation
            e.preventDefault();
            // Show exit confirmation
            handleExitApp(t);
          },
        }}
        options={{
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="power-off" color={color} />
          ),
          tabBarLabel: t('exit.tabLabel'),
          // Hide the screen but keep tab visible
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerLeftText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.topBannerText,
  },
  headerRightText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.topBannerText,
  },
});
