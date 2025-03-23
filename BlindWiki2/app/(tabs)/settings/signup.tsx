import { StyleSheet, Text, TextInput, View, Alert, Pressable} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import StyledButton from '@/components/StyledButton';
import Colors from '@/constants/Colors';
import StyledInput from '@/components/StyledInput';
import TextLink from '@/components/TextLink';

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setrepeatedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    // Validation
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      // Create form data for x-www-form-urlencoded content type
      const formData = new URLSearchParams();
      formData.append('LoginForm[username]', username);
      formData.append('LoginForm[password]', password);
      formData.append('LoginForm[latitude]', '41.38879');  // Use actual location values from device
      formData.append('LoginForm[longitude]', '2.15899');  // or use global state

      const response = await fetch('https://api.blind.wiki/site/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('Login successful:', data);
        
        // Save the session ID or token
        if (data.PHPSESSID) {
          // Store this in secure storage or context
          console.log('Session ID:', data.PHPSESSID);
        }
        
        // Navigate back to previous screen
        router.back();
      } else {
        // Handle API errors
        Alert.alert('Login Failed', data.message || 'Please check your credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        
        <Text style={styles.text}>
          Join the BlindWiki community by filling the following form
        </Text>
        <StyledInput value={email} onchangeText={setEmail} placeholder="Email" />
        <StyledInput value={username} onchangeText={setUsername} placeholder="Username"/>
        <StyledInput value={password} onchangeText={setPassword} placeholder="Password" secure={true} />
        <StyledInput value={repeatedPassword} onchangeText={setrepeatedPassword} placeholder="Repeat Password" secure={true} />
        
          <StyledButton title="Register" onPress={handleLogin} />

        <TextLink url='www.blind.wiki/terms' style={styles.text}>
          By Signing up, you agree to our Terms of Service and Privacy Policy
        </TextLink>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },

  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  text: {
    color: Colors.light.text,
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 30,
  }
});