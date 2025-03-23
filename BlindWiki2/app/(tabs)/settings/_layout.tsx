import { Stack } from "expo-router";
import Colors from "@/constants/Colors";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTintColor: Colors.light.text,
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "Settings",
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          title: "Log In",
          presentation: "card",
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          title: "Sign Up",
          presentation: "card",
        }}
      />
    </Stack>
  );
}