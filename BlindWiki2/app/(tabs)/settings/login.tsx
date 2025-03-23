import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Pressable,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import StyledButton from "@/components/StyledButton";
import Colors from "@/constants/Colors";
import StyledInput from "@/components/StyledInput";
import TextLink from "@/components/TextLink";
import { login } from '@/services/authService';

export default function LogInScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
  
    setLoading(true);
  
    try {
      // The login service now returns a cleaned response
      const response = await login(
        username, 
        password, 
        "41.38879", 
        "2.15899"
      );
      
      if (response.success) {
        console.log("Login successful as:", response.username);
        router.back();
      } else {
        // Handle login failure with error from response
        Alert.alert("Login Failed", response.errorMessage || "Please check your credentials");
      }
    } catch (error: unknown) {
      // This will only trigger for network errors or other exceptions
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Network error occurred";
      Alert.alert("Connection Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StyledInput
        value={username}
        onchangeText={setUsername}
        placeholder="Username"
      />
      <StyledInput
        value={password}
        onchangeText={setPassword}
        placeholder="Password"
        secure={true}
      />

      <View style={styles.buttonContainer}>
        <StyledButton title="Log In" onPress={handleLogin} />
        <StyledButton
          title="Forgot your password?"
          onPress={() => router.back()}
        />
      </View>
      <Pressable
        onPress={() => router.push("/(tabs)/settings/signup")}
        style={styles.signUpContainer}
      >
        <View style={styles.signUpRow}>
          <Text style={styles.signUpText}>You do not have an account? </Text>
          <Text style={styles.signUpNowText}>Sign up now</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 10,
  },

  signUpContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center', 
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  signUpText: {
    color: Colors.light.text,
    fontSize: 18,
  },
  signUpNowText: {
    fontSize: 18,
    textDecorationLine: 'underline',
    color: Colors.light.primary,
  },
});
