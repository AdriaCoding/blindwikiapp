import { StyleSheet, Alert, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { InstructionsText } from '@/components/InstructionsText';
import LocationComponent from '@/components/Location';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import StyledButton from '@/components/StyledButton';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { location, getCurrentLocation, isLoading, error: locationError } = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
    // Running‐range per platform for Min–Max scaling
    const rangeRef = useRef<any>({
      android: { min: Infinity, max: -Infinity },
      ios:     { min: Infinity, max: -Infinity },
    });
  
    // Update min/max range
    function updateRange(stats: any, x: number) {
      stats.min = Math.min(stats.min, x);
      stats.max = Math.max(stats.max, x);
    }
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
      console.log("Location: ", location, "isLoading: ", isLoading, "locationError: ", locationError);
      if (!location || isLoading || locationError) {
        if (locationError) {
          Alert.alert(
            t('recording.errorTitle'),
            locationError
          );
          return;
        }
        if (isLoading) {
          Alert.alert(
            t('recording.errorTitle'),
            t('recording.locationIsLoading')
          );
          return;
        }
        Alert.alert(
          t('recording.errorTitle'),
          t('recording.locationRequired')
        );
        return;
      }

      // Web platform handling for recording
      if (Platform.OS === 'web') {
        try {
          // Check if browser supports MediaRecorder
          if (!window.MediaRecorder) {
            Alert.alert(
              t('recording.errorTitle'),
              'Su navegador no soporta la grabación de audio'
            );
            return;
          }

          // Request microphone permission
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          // Para web, simular niveles de audio ya que la API no proporciona metering
          // Iniciar un temporizador para simular cambios en el nivel de audio
          const simulateAudioLevel = () => {
            // Generar un valor aleatorio entre 0.3 y 0.9 para que sea visible
            const simulatedLevel = 0.3 + (Math.random() * 0.6);
            setAudioLevel(simulatedLevel);
          };
          
          // Actualizar cada 200ms para simular cambios en el nivel de audio
          const intervalId = setInterval(simulateAudioLevel, 200);
          
          // Guardar el ID del intervalo para limpiarlo después
          // @ts-ignore - Almacenar en el objeto window para acceso global
          window._recordingIntervalId = intervalId;
        } catch (webError) {
          console.error('Web: Error accessing microphone', webError);
          Alert.alert(
            t('recording.errorTitle'),
            'Error al acceder al micrófono. Asegúrese de que su navegador tiene permisos para usar el micrófono.'
          );
          return;
        }
      }

      // Configure recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Custom recording options for AAC format
      const recordingOptions: Audio.RecordingOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          extension: '.aac',
          outputFormat: Audio.AndroidOutputFormat.AAC_ADTS,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.aac',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        }
      };
      
      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        (status) => {
          if (status.isRecording && status.metering !== undefined) {
            const dB = status.metering;
            const platform = Platform.OS; // 'android' or 'ios'
            const range = (rangeRef.current as any)[platform];

            updateRange(range, dB);
            let normalized = range.max > range.min
              ? (dB - range.min) / (range.max - range.min)
              : 0;
            normalized = Math.max(0, Math.min(1, normalized));

            setAudioLevel(normalized);
          }
        },
        100
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
      // Limpiar intervalo de simulación de audio para web
      if (Platform.OS === 'web' && (window as any)._recordingIntervalId) {
        clearInterval((window as any)._recordingIntervalId);
        (window as any)._recordingIntervalId = null;
      }
      
      await recordingInstance.stopAndUnloadAsync();
      const originalUri = recordingInstance.getURI();
      
      if (originalUri) {
        // Web platform handling
        if (Platform.OS === 'web') {
          setRecordingUri(originalUri);
          setRecordingInstance(null);
          setIsRecording(false);
          setAudioLevel(0);
          
          // Navigate to edit screen with the recording URI
          router.push({
            pathname: '/edit',
            params: { 
              recordingUri: originalUri,
              latitude: location?.coords.latitude?.toString() || '',
              longitude: location?.coords.longitude?.toString() || ''
            }
          });
          return;
        }
        
        // Native platforms (iOS/Android)
        // Ensure the file exists before proceeding
        const fileInfo = await FileSystem.getInfoAsync(originalUri);
        
        if (fileInfo.exists) {
          // Create a new file in app's documents directory with a simple name
          const timestamp = Date.now();
          const extension = Platform.OS === 'ios' ? '.aac' : '.mp3';
          const newFilename = `recording-${timestamp}${extension}`;
          const newUri = `${FileSystem.documentDirectory}${newFilename}`;
          
          try {
            // Copy the file to a location with a simpler path
            await FileSystem.copyAsync({
              from: originalUri,
              to: newUri
            });
            
            // Verify the new file exists
            const newFileInfo = await FileSystem.getInfoAsync(newUri);
            
            if (newFileInfo.exists) {
              setRecordingUri(newUri);
              setRecordingInstance(null);
              setIsRecording(false);
              setAudioLevel(0);
              
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
            setAudioLevel(0);
            
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
      setAudioLevel(0);
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
        audioLevel={audioLevel}
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
    width: "80%",
    marginVertical: 40,
  },
  recordButtonText: {
    fontSize: 20,
  },
});
