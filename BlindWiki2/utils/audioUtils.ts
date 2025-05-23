import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

interface PlaybackStatus {
  isPlaying: boolean;
  sound: Audio.Sound | null;
}

interface PlaybackOptions {
  onPlaybackStatusChange?: (isPlaying: boolean) => void;
  onError?: (error: string) => void;
}

export async function playAudio(
  audioUri: string,
  options: PlaybackOptions = {}
): Promise<PlaybackStatus> {
  const { onPlaybackStatusChange, onError } = options;
  const isRemoteUri = audioUri?.startsWith('http');
  let sound: Audio.Sound | null = null;
  let isPlaying = false;

  try {
    // Configure audio output
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    // Check file existence (except for web and remote URIs)
    if (!isRemoteUri && Platform.OS !== 'web') {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file not found');
      }
    }

    console.log(`Loading audio from: ${audioUri}`);

    // Load and play the audio
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { shouldPlay: true }
    );
    
    sound = newSound;
    isPlaying = true;
    onPlaybackStatusChange?.(true);

    // Set up playback status listener
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
        isPlaying = false;
        onPlaybackStatusChange?.(false);
      }
    });

    return { sound, isPlaying };
  } catch (error) {
    console.error("Failed to play audio", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Unknown error occurred";
    
    onError?.(errorMessage);
    return { sound: null, isPlaying: false };
  }
}

export async function stopAudio(sound: Audio.Sound | null): Promise<void> {
  if (sound) {
    await sound.stopAsync();
    await sound.unloadAsync();
  }
} 