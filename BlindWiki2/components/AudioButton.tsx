import React, { useState, useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import StyledButton from './StyledButton';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';

interface AudioButtonProps {
  /**
   * URI of the audio file to play (can be a local file path or remote URL)
   */
  audioUri: string;
  
  /**
   * Optional callback when playback status changes
   */
  onPlaybackStatusChange?: (isPlaying: boolean) => void;
  
  /**
   * Optional custom style for the button
   */
  style?: StyleProp<ViewStyle>;
  
  /**
   * Optional automatic playback when component mounts
   */
  autoPlay?: boolean;

  /**
   * Optional context - 'message' for message list view, 'edit' for editing screen
   * This affects which translations are used
   */
  context?: 'message' | 'edit';
}

export default function AudioButton({
  audioUri,
  onPlaybackStatusChange,
  style,
  autoPlay = false,
  context = 'edit'
}: AudioButtonProps) {
  const { t } = useTranslation();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Determine if the URI is a remote URL or local file
  const isRemoteUri = audioUri?.startsWith('http');

  // Clean up sound resources when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Auto-play audio when requested
  useEffect(() => {
    if (autoPlay && audioUri) {
      togglePlayback();
    }
  }, []);

  // Get the appropriate text based on context
  const getButtonText = (playing: boolean) => {
    if (context === 'message') {
      return playing ? t("message.stopPlayback") : t("message.listen");
    } else {
      return playing ? t("edit.stopPlayback") : t("edit.playRecording");
    }
  };

  // Handle errors based on context
  const handlePlaybackError = (errorMessage: string) => {
    if (context === 'message') {
      Alert.alert(
        t("message.playbackError"),
        t("message.playbackErrorMessage")
      );
    } else {
      Alert.alert(
        t("edit.playbackError"),
        t("edit.playbackErrorMessage")
      );
    }
  };

  // Toggle between playing and stopping the audio
  const togglePlayback = async () => {
    // If already playing, stop playback
    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      onPlaybackStatusChange?.(false);
      return;
    }

    try {
      // Unload previous sound if it exists
      if (sound) {
        await sound.unloadAsync();
      }

      // Skip file existence check on web platform
      if (!isRemoteUri && Platform.OS !== 'web') {
        try {
          const fileInfo = await FileSystem.getInfoAsync(audioUri);
          if (!fileInfo.exists) {
            throw new Error('Audio file not found');
          }
        } catch (fileError) {
          console.error("Error checking file existence:", fileError);
          // On non-web platforms, rethrow the error
          throw fileError;
        }
      }

      console.log(`Loading audio from: ${audioUri}`);

      // Load the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      onPlaybackStatusChange?.(true);

      // Listen for playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlaying(false);
          onPlaybackStatusChange?.(false);
        }
      });
    } catch (error) {
      console.error("Failed to play audio", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
      
      handlePlaybackError(errorMessage);
    }
  };

  // Stop playback programmatically (can be called from parent)
  const stopPlayback = async () => {
    if (sound && isPlaying) {
      await sound.stopAsync();
      setIsPlaying(false);
      onPlaybackStatusChange?.(false);
    }
  };

  return (
    <StyledButton
      title={getButtonText(isPlaying)}
      onPress={togglePlayback}
      style={style}
    />
  );
} 