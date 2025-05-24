import { StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { InstructionsText } from '@/components/InstructionsText';
import LocationComponent from '@/components/Location';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import StyledButton from '@/components/StyledButton';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { publishMessage } from "@/services/messageService";
import { useLocation } from '@/contexts/LocationContext';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Colors from '@/constants/Colors';
import { playAudio, stopAudio } from '@/utils/audioUtils';

const AUDIO_CONFIG = {
  allowsRecordingIOS: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
};

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
  android: {
    extension: '.mp3',
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

export default function HomeScreen() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { location, isLoading: locationLoading, error: locationError, address } = useLocation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);

  const rangeRef = useRef<any>({
    android: { min: Infinity, max: -Infinity },
    ios: { min: Infinity, max: -Infinity },
  });

  const stopRecording = async () => {
    if (!recordingInstance) return;
    
    try {
      await recordingInstance.stopAndUnloadAsync();
      const originalUri = recordingInstance.getURI();
      
      if (!originalUri || !(await FileSystem.getInfoAsync(originalUri)).exists) {
        throw new Error('Recording file not found');
      }

      const timestamp = Date.now();
      const extension = Platform.OS === 'ios' ? '.aac' : '.mp3';
      const newUri = `${FileSystem.documentDirectory}recording-${timestamp}${extension}`;
      
      await FileSystem.copyAsync({ from: originalUri, to: newUri });
      
      if (!(await FileSystem.getInfoAsync(newUri)).exists) {
        throw new Error('Failed to save recording');
      }

      // Start playback of the preview
      const { sound } = await playAudio(originalUri, {
        onError: (error) => {
          console.error('Preview playback error:', error);
        }
      });
      setPreviewSound(sound);
      
      setRecordingInstance(null);
      setIsRecording(false);
      setAudioLevel(0);
      
      Alert.alert(t("edit.quickPublishTitle"), "", [
        {
          text: t("edit.publishButton"),
          onPress: async () => {
            await stopAudio(sound);
            setPreviewSound(null);
            handleQuickPublish(newUri);
          },
        },
        {
          text: t("edit.quickPublishChangeTags"),
          onPress: async () => {
            await stopAudio(sound);
            setPreviewSound(null);
            router.push({
              pathname: '/edit',
              params: { 
                recordingUri: newUri,
                latitude: location?.coords.latitude?.toString() || '',
                longitude: location?.coords.longitude?.toString() || ''
              }
            });
          },
        },
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: async () => {
            await stopAudio(sound);
            setPreviewSound(null);
            setIsRecording(false);
          },
        },
      ]);
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setIsRecording(false);
      setRecordingInstance(null);
      setAudioLevel(0);
      Alert.alert(t('recording.errorTitle'), t('recording.stopError'));
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status === 'granted') {
        await Audio.setAudioModeAsync(AUDIO_CONFIG);
      }
    })();

    return () => {
      if (recordingInstance) {
        stopRecording();
      }
    };
  }, []);

  // Add cleanup effect for preview sound
  useEffect(() => {
    return () => {
      if (previewSound) {
        stopAudio(previewSound);
      }
    };
  }, [previewSound]);

  const startRecording = async () => {
    try {
      // Check if we have location data
      if (!location || locationLoading || locationError) {
        if (locationError) {
          Alert.alert(
            t('recording.errorTitle'),
            locationError
          );
          return;
        }
        if (locationLoading) {
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

      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS,
        (status) => {
          if (status.isRecording && status.metering !== undefined) {
            const platform = Platform.OS;
            const range = rangeRef.current[platform];
            const dB = status.metering;
            
            range.min = Math.min(range.min, dB);
            range.max = Math.max(range.max, dB);
            
            const normalized = range.max > range.min
              ? Math.max(0, Math.min(1, (dB - range.min) / (range.max - range.min)))
              : 0;

            setAudioLevel(normalized);
          }
        },
        100
      );
      
      setRecordingInstance(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert(t('recording.errorTitle'), t('recording.startError'));
    }
  };

  const handleQuickPublish = async (uri: string) => {
    if (!uri || !location?.coords.latitude || !location?.coords.longitude) {
      Alert.alert(t("edit.missingData"));
      return;
    }

    setIsUploading(true);
    setIsRecording(false);

    try {
      const addressText = address
        ? `${address.street || ""} ${address.city || ""}, ${address.country || ""}`.trim()
        : "";

      const response = await publishMessage(
        uri,
        location.coords.latitude.toString(),
        location.coords.longitude.toString(),
        addressText,
        ""
      );

      setIsUploading(false);
      
      if (response.success) {
        Alert.alert(t("edit.publishSuccess"), t("edit.publishSuccessMessage"), [
          { text: "OK", onPress: () => router.replace("/(tabs)") }
        ]);
      } else {
        Alert.alert(t("edit.publishFailed"), response.errorMessage);
      }
    } catch (error) {
      console.error("Error publishing message:", error);
      setIsUploading(false);
      Alert.alert(t("edit.publishFailed"), t("edit.networkError"));
    }
  };

  const toggleRecording = async () => {
    if (!isLoggedIn()) {
      Alert.alert(t('login.required'), t('login.recordingMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('login.title'), onPress: () => router.push('/login') }
      ]);
      return;
    }

    if (hasPermission === null) {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert(t('recording.permissionTitle'), t('recording.permissionRequired'));
        return;
      }
    }

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
      {isUploading ? (
        <View style={[styles.recordButton, styles.activityContainer]}>
          <ActivityIndicator size="large" color={Colors.light.button.text} />
        </View>
      ) : (
        <StyledButton 
          onPress={toggleRecording}
          title={t('home.record')}
          style={styles.recordButton}
          textStyle={styles.recordButtonText}
          isRecording={isRecording}
          audioLevel={audioLevel}
        />
      )}
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
  activityContainer: {
    backgroundColor: Colors.light.button.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
