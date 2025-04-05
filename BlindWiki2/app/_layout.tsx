import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "../locales/i18n";
import "react-native-reanimated";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import Colors from "@/constants/Colors";

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

  //<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
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
      )}
    </>
  );
}
