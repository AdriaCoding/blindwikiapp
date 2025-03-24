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
import { useAuth } from '@/contexts/AuthContext';

export default function LogInScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    // Input validation
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
   
    const response = await login(username, password);
    if (response.success) {
      router.back();
    } else {
      Alert.alert('Login Failed', response.errorMessage || 'Please check your credentials');
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
