import {
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import StyledButton from "@/components/StyledButton";
import Colors from "@/constants/Colors";
import StyledInput from "@/components/StyledInput";
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from "react-i18next";
import { t } from "i18next";

export default function LogInScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async () => {
    // Reset error state
    setErrorMessage(null);
    
    // Input validation
    if (!username || !password) {
      setErrorMessage(t("login.error.input"));
      return;
    }
    setIsLoading(true);
    
    try {
      const response = await login(username, password);
      if (response.errorMessage === "Incorrect username or password.") {
        console.log("Credential error from login");
        // Credential error - stay on page with message, clear password
        setErrorMessage(t("login.error.credentials"));
        setPassword(""); // Clear password for security and to indicate a retry is needed
      }
      else if (response.success) {
        // Success - navigate back
        router.back();
      }
      else {
        // Other error - stay on page with message
        setErrorMessage(response.errorMessage || t("login.error.default"));
      }
    } catch (error) {
      // Unexpected error
      setErrorMessage("A network error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await Linking.openURL('https://blind.wiki/user/resetPassword');
    } catch (error) {
      console.error('Error opening link:', error);
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
        placeholder={t("login.username")}
        autoFocus={true}
      />
      
      <StyledInput
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errorMessage) setErrorMessage(null); // Clear error when user types
        }}
        placeholder={t("login.password")}
        secureTextEntry={true}
      />

      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.light.primary} />
        ) : (
          <StyledButton title={t("login.title")} onPress={handleLogin} />
        )}
        <StyledButton
          title={t("login.forgotPassword")}
          onPress={handleForgotPassword}
        />
      </View>
      
      <Pressable
        onPress={() => router.push("/signup")}
        style={styles.signUpContainer}
      >
        <View style={styles.signUpRow}>
          <Text style={styles.signUpText}>{t("login.noAccount.text")} </Text>
          <Text style={styles.signUpNowText}>{t("login.noAccount.link")}</Text>
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
