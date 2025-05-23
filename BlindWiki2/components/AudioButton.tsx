import React, { useState, useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import StyledButton from './StyledButton';
import { useTranslation } from 'react-i18next';
import { playAudio, stopAudio } from '../utils/audioUtils';

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

  // Clean up sound resources when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          stopAudio(sound);
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
      await stopAudio(sound);
      setSound(null);
      setIsPlaying(false);
      onPlaybackStatusChange?.(false);
      return;
    }

    // Start new playback
    const playbackStatus = await playAudio(audioUri, {
      onPlaybackStatusChange: (playing) => {
        setIsPlaying(playing);
        onPlaybackStatusChange?.(playing);
      },
      onError: handlePlaybackError
    });

    setSound(playbackStatus.sound);
    setIsPlaying(playbackStatus.isPlaying);
  };

  return (
    <StyledButton
      title={getButtonText(isPlaying)}
      onPress={togglePlayback}
      style={style}
    />
  );
} 