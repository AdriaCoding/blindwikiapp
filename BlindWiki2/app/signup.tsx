import { StyleSheet, Text, View, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import StyledButton from '@/components/StyledButton';
import Colors from '@/constants/Colors';
import TextLink from '@/components/TextLink';
import { useAuth } from '@/contexts/AuthContext';
import StyledInput from '@/components/StyledInput';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const { register, isLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const validateForm = (): boolean => {
    if (!username.trim()) {
      Alert.alert(t('register.error.title'), t('register.error.emptyUsername'));
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      Alert.alert(t('register.error.title'), t('register.error.invalidEmail'));
      return false;
    }
    
    if (password.length < 4) {
      Alert.alert(t('register.error.title'), t('register.error.passwordTooShort'));
      return false;
    }
    
    if (password !== repeatPassword) {
      Alert.alert(t('register.error.title'), t('register.error.passwordsDoNotMatch'));
      return false;
    }
    
    return true;
  };


  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      const response = await register(username, password, email);
      
      if (response.success) {
        // Save the email for reference
        setRegisteredEmail(response.email || email);
        
        // Show confirmation alert
        Alert.alert(
          t('register.success.title', 'Registration Successful'),
          t('register.success.emailSent', 'A confirmation link has been sent to your email address. Please check your inbox and click the link to activate your account.'),
          [
            {
              text: t('register.success.ok', 'OK'),
              onPress: () => {
                // Clear navigation stack and go back to settings
                router.navigate('/(tabs)');
              }
            }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          t('register.error.title'), 
          response.errorMessage || t('register.error.defaultError')
        );
      }
    } catch (error) {
      Alert.alert(
        t('register.error.title'),
        error instanceof Error ? error.message : t('register.error.networkError')
      );
    }
  };

  return (
    <View style={styles.container}>
        
        <Text style={styles.text}>
          {t('register.title')}
        </Text>
        <StyledInput value={email} onChangeText={setEmail} placeholder={t('register.email')}/>
        <StyledInput value={username} onChangeText={setUsername} placeholder={t('register.username')}/>
        <StyledInput value={password} onChangeText={setPassword} placeholder={t('register.password')} secureTextEntry={true} />
        <StyledInput value={repeatPassword} onChangeText={setRepeatPassword} placeholder={t('register.repeatPassword')} secureTextEntry={true} />
        
          <StyledButton title={t('register.button')} onPress={handleRegister} />

        <TextLink url='www.blind.wiki/terms' style={styles.text}>
          {t('register.terms')}
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