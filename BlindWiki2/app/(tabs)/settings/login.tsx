import {
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import StyledButton from "@/components/StyledButton";
import Colors from "@/constants/Colors";
import StyledInput from "@/components/StyledInput";
import { useAuth } from '@/contexts/AuthContext';

export default function LogInScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Reset error state
    setErrorMessage(null);
    
    // Input validation
    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      return;
    }
   
    setIsLoading(true);
    
    try {
      const response = await login(username, password);
      if (response.errorMessage === "Incorrect username or password.") {
        console.log("Credential error from login");
        // Credential error - stay on page with message, clear password
        setErrorMessage("The username or password you entered is incorrect. Please try again.");
        setPassword(""); // Clear password for security and to indicate a retry is needed
      }
      else if (response.success) {
        // Success - navigate back
        router.back();
      }
      else {
        // Other error - stay on page with message
        setErrorMessage(response.errorMessage || "An error occurred during login");
      }
    } catch (error) {
      // Unexpected error
      setErrorMessage("A network error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Error message display */}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
      
      <StyledInput
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          if (errorMessage) setErrorMessage(null); // Clear error when user types
        }}
        placeholder="Username"
        autoFocus={true}
      />
      
      <StyledInput
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errorMessage) setErrorMessage(null); // Clear error when user types
        }}
        placeholder="Password"
        secureTextEntry={true}
      />

      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.light.primary} />
        ) : (
          <StyledButton title="Log In" onPress={handleLogin} />
        )}
        <StyledButton
          title="Forgot your password?"
          onPress={() => router.push("/(tabs)/settings")}
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
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#b71c1c',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 10,
    minHeight: 80, // Ensure space for activity indicator
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
