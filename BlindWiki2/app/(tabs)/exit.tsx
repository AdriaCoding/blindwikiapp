import React from 'react';
import { View, Alert, BackHandler, Platform } from 'react-native';

// Function to handle exiting the app
export const handleExitApp = (t: (key: string) => string) => {
  Alert.alert(
    t("exit.title"),
    t("exit.message"),
    [
      {
        text: t("common.cancel"),
        style: "cancel"
      },
      { 
        text: t("exit.confirmButton"), 
        onPress: () => {
          if (Platform.OS === 'android') {
            BackHandler.exitApp();
          } else if (Platform.OS === 'web') {
            // Attempt to close window - may be blocked by browsers
            window.close();
          }
          // On iOS, we can't force quit, but we'll close the alert at least
        }
      }
    ]
  );
  return true; // Return true to prevent navigation
};

// This is a placeholder screen that is never actually shown
// The exit functionality is handled in the tab press event in _layout.tsx
export default function ExitScreen() {
  return <View />;
} 