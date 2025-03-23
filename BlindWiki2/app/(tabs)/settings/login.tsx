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
      // Create form data for x-www-form-urlencoded content type
      const formData = new URLSearchParams();
      formData.append("LoginForm[username]", username);
      formData.append("LoginForm[password]", password);
      formData.append("LoginForm[latitude]", "41.38879"); // Use actual location values from device
      formData.append("LoginForm[longitude]", "2.15899"); // or use global state

      const response = await fetch("https://api.blind.wiki/site/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);

        // Save the session ID or token
        if (data.PHPSESSID) {
          // Store this in secure storage or context
          console.log("Session ID:", data.PHPSESSID);
        }

        // Navigate back to previous screen
        router.back();
      } else {
        // Handle API errors
        Alert.alert(
          "Login Failed",
          data.message || "Please check your credentials"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Network error. Please try again.");
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
