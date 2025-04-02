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
      
      // Custom recording options for mp3 format if possible
      const recordingOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.mp3',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: '.mp3',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };
      
      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        (status) => {
          console.log('Recording status:', status);
        },
        100
      );
      
      setRecordingInstance(recording);
      setIsRecording(true);
      
      console.log('Recording started');
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
      const originalUri = recordingInstance.getURI();
      
      if (originalUri) {
        // Ensure the file exists before proceeding
        const fileInfo = await FileSystem.getInfoAsync(originalUri);
        console.log('Recording file info:', fileInfo);
        
        if (fileInfo.exists) {
          // Create a new file in app's documents directory with a simple name
          const timestamp = Date.now();
          const newFilename = `recording-${timestamp}.mp3`;
          const newUri = `${FileSystem.documentDirectory}${newFilename}`;
          
          console.log(`Copying recording from ${originalUri} to ${newUri}`);
          
          try {
            // Copy the file to a location with a simpler path
            await FileSystem.copyAsync({
              from: originalUri,
              to: newUri
            });
            
            // Verify the new file exists
            const newFileInfo = await FileSystem.getInfoAsync(newUri);
            console.log('New file info:', newFileInfo);
            
            if (newFileInfo.exists) {
              setRecordingUri(newUri);
              setRecordingInstance(null);
              setIsRecording(false);
              
              // Navigate to edit screen with the new recording URI
              router.push({
                pathname: '/edit',
                params: { 
                  recordingUri: newUri,
                  latitude: location?.coords.latitude?.toString() || '',
                  longitude: location?.coords.longitude?.toString() || ''
                }
              });
            } else {
              throw new Error('Copied file not found');
            }
          } catch (copyError) {
            console.error('Failed to copy recording:', copyError);
            
            // Fall back to using the original URI if copy failed
            setRecordingUri(originalUri);
            setRecordingInstance(null);
            setIsRecording(false);
            
            router.push({
              pathname: '/edit',
              params: { 
                recordingUri: originalUri,
                latitude: location?.coords.latitude?.toString() || '',
                longitude: location?.coords.longitude?.toString() || ''
              }
            });
          }
        } else {
          throw new Error('Recording file not found');
        }
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
