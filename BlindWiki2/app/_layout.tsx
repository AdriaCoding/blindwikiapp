import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../locales/i18n";
import "react-native-reanimated";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import Colors from "@/constants/Colors";
import { Platform, View, StyleSheet, Dimensions } from "react-native";

// Only enable in development
import { setupDebug } from "@/utils/debug";
import LoadingScreen from "./loading";

if (__DEV__) {
  setupDebug();
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "screens",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Function to detect if user is on a mobile device when on web
const isMobileDevice = () => {
  if (Platform.OS !== 'web') return false;
  
  // Check if this is being accessed via common mobile browsers
  const userAgent = window.navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android', 'iphone', 'ipod', 'ipad', 'windows phone', 
    'blackberry', 'samsung', 'opera mini', 'mobile', 'tablet'
  ];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <AuthProvider>
        <LocationProvider>
          <I18nextProvider i18n={i18n}>
            <RootLayoutNav />
          </I18nextProvider>
        </LocationProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

function RootLayoutNav() {
  //const { isLoading } = useAuth();
  // Show loading screen while checking credentials and auto-login
  const isLoading = false;
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      const checkIfMobile = () => {
        setIsMobile(isMobileDevice());
      };
      
      checkIfMobile();
      
      // Check again if window is resized
      window.addEventListener('resize', checkIfMobile);
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  // Content to render
  const content = (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="login" options={{title: "Log In"}} />
      <Stack.Screen name="signup" options={{title: "Sign Up"}} />
      <Stack.Screen name="edit" options={{title: "Edit Post"}} />
    </Stack>
  );

  // For web platform on desktop, wrap content in a container that simulates mobile view
  if (Platform.OS === 'web' && !isMobile) {
    return (
      <View style={styles.webContainer}>
        <View style={styles.phoneContainer}>
          {isLoading ? <LoadingScreen /> : content}
        </View>
      </View>
    );
  }

  // For native platforms or web on mobile, render normally
  return (
    <>
      {isLoading ? <LoadingScreen /> : content}
    </>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  phoneContainer: {
    width: 390, // iPhone 12/13/14 width
    height: '100%',
    maxHeight: 844, // iPhone 12/13/14 height
    overflow: 'hidden',
    borderRadius: 40,
    borderWidth: 10,
    borderColor: '#333',
    backgroundColor: Colors.light.background,
  },
});
