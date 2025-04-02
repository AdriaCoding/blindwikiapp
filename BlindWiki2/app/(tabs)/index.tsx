import { StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { InstructionsText } from '@/components/StyledText';
import LocationComponent from '@/components/Location';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { Text, View } from 'react-native';
import StyledButton from '@/components/StyledButton';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { location } = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  
  // Request recording permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    
    // Set audio mode for recording
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });
    
    // Cleanup function
    return () => {
      if (recordingInstance) {
        stopRecording();
      }
    };
  }, []);
  
  // Function to start recording
  const startRecording = async () => {
    try {
      // Check if we have location data
      if (!location) {
        Alert.alert(
          t('location.permissionTitle'),
          t('location.permissionRequired')
        );
        return;
      }

      // Configure recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecordingInstance(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert(
        t('recording.errorTitle'),
        t('recording.startError')
      );
    }
  };
  
  // Function to stop recording
  const stopRecording = async () => {
    if (!recordingInstance) return;
    
    try {
      await recordingInstance.stopAndUnloadAsync();
      const uri = recordingInstance.getURI();
      setRecordingUri(uri);
      setRecordingInstance(null);
      setIsRecording(false);
      
      // Navigate to edit screen with recording data
      if (uri) {
        router.push({
          pathname: '/edit',
          params: { 
            recordingUri: uri,
            latitude: location?.coords.latitude?.toString() || '',
            longitude: location?.coords.longitude?.toString() || ''
          }
        });
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setIsRecording(false);
      setRecordingInstance(null);
      Alert.alert(
        t('recording.errorTitle'),
        t('recording.stopError')
      );
    }
  };
  
  // Toggle recording function
  const toggleRecording = async () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      Alert.alert(
        t('login.required'),
        t('login.recordingMessage'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel'
          },
          {
            text: t('login.title'),
            onPress: () => router.push('/login')
          }
        ]
      );
      return;
    }
    
    // Check and request permission if not already granted
    if (hasPermission === null) {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          t('recording.permissionTitle'),
          t('recording.permissionRequired')
        );
        return;
      }
    } else if (hasPermission === false) {
      Alert.alert(
        t('recording.permissionTitle'),
        t('recording.permissionRequired')
      );
      return;
    }
    
    // Toggle recording state
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <View style={styles.homeContainer}>
      <InstructionsText>{t('home.info-gps')}</InstructionsText>
      <LocationComponent />
      <InstructionsText>{t('home.info-record')}</InstructionsText>
      <StyledButton 
        onPress={toggleRecording}
        title={t('home.record')}
        style={styles.recordButton}
        textStyle={styles.recordButtonText}
        isRecording={isRecording}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    alignItems: "center",
    margin: 10
  },
  recordButton: {
    flex: 2,
    width: "95%",
  },
  recordButtonText: {
    fontSize: 20,
  },
});
