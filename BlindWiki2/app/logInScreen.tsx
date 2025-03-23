import { StyleSheet, Text, TextInput, View, Alert} from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import BWButton from '@/components/BWButton';
import Colors from '@/constants/Colors';

export default function LogInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      <View style={styles.card}>
        <Text style={styles.title}>Log In</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        
        <View style={styles.buttonContainer}>
          <BWButton title="Log In" onPress={handleLogin} />
          <BWButton title="Cancel" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: 10,
  }
});