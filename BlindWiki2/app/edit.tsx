import { StyleSheet, View, TextInput, Text, Alert } from "react-native";
import { useState, useEffect } from "react";
import StyledInput from "@/components/StyledInput";
import { useLocalSearchParams, router } from "expo-router";
import { Audio } from "expo-av";
import StyledButton from "@/components/StyledButton";
import { useTranslation } from "react-i18next";
import { publishMessage } from "@/services/messageService";
import Colors from "@/constants/Colors";
import { useLocation } from "@/contexts/LocationContext";

export default function EditScreen() {
  const { t } = useTranslation();
  const { location, address } = useLocation();
  const params = useLocalSearchParams<{
    recordingUri: string;
    latitude: string;
    longitude: string;
  }>();

  const [recordingUri] = useState<string>(params.recordingUri || "");
  // Use params for latitude/longitude if provided, otherwise use context
  const [latitude] = useState<string>(
    params.latitude || location?.coords.latitude?.toString() || ""
  );
  const [longitude] = useState<string>(
    params.longitude || location?.coords.longitude?.toString() || ""
  );
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tags, setTags] = useState("");
  // Pre-fill address if available from context
  const [addressText, setAddressText] = useState(
    address ? 
    `${address.street || ""} ${address.city || ""}, ${address.country || ""}`.trim() : 
    ""
  );
  const [isUploading, setIsUploading] = useState(false);

  // Clean up sound resources when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Function to play the recorded audio
  const playRecording = async () => {
    try {
      // Unload previous sound if it exists
      if (sound) {
        await sound.unloadAsync();
      }

      // Load the recording
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      // Listen for playback status updates
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("Failed to play recording", error);
      Alert.alert(t("edit.playbackError"));
    }
  };

  // Handle publish button press
  const handlePublish = async () => {
    if (!recordingUri || !latitude || !longitude) {
      Alert.alert(t("edit.missingData"));
      return;
    }

    setIsUploading(true);

    try {
      const response = await publishMessage(
        recordingUri, 
        latitude, 
        longitude, 
        addressText,
        tags
      );

      if (response.success) {
        Alert.alert(
          t("edit.publishSuccess"),
          t("edit.publishSuccessMessage"),
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)"),
            },
          ]
        );
      } else {
        Alert.alert(t("edit.publishFailed"), response.errorMessage);
      }
    } catch (error) {
      console.error("Error publishing message:", error);
      Alert.alert(t("edit.publishFailed"), t("edit.networkError"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      t("edit.cancelConfirmTitle"),
      t("edit.cancelConfirmMessage"),
      [
        {
          text: t("common.no"),
          style: "cancel",
        },
        {
          text: t("common.yes"),
          onPress: () => router.back(),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("edit.recordingLabel")}</Text>
      
      <StyledButton
        title={isPlaying ? t("edit.stopPlayback") : t("edit.playRecording")}
        onPress={playRecording}
        style={styles.playButton}
      />
      
      <Text style={styles.label}>{t("edit.tagsLabel")}</Text>
      <StyledInput
        placeholder={t("edit.tagsPlaceholder")}
        value={tags}
        onChangeText={setTags}
        style={styles.input}
        multiline={false}
        maxLength={100}
      />
      
      <Text style={styles.label}>{t("edit.addressLabel")}</Text>
      <StyledInput
        placeholder={t("edit.addressPlaceholder")}
        value={addressText}
        onChangeText={setAddressText}
        style={styles.input}
        multiline={true}
        numberOfLines={3}
        maxLength={200}
      />
      
      <View style={styles.buttonContainer}>
        <StyledButton
          title={t("edit.cancelButton")}
          onPress={handleCancel}
          style={styles.cancelButton}
          textStyle={styles.cancelButtonText}
        />
        
        <StyledButton
          title={isUploading ? t("edit.uploading") : t("edit.publishButton")}
          onPress={handlePublish}
          style={[styles.publishButton, isUploading && styles.uploadingButton]}
          textStyle={styles.publishButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    width: "100%",
    marginBottom: 12,
  },
  playButton: {
    marginVertical: 12,
    backgroundColor: Colors.light.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cancelButtonText: {
    color: Colors.light.text,
  },
  publishButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.light.primary,
  },
  publishButtonText: {
    color: Colors.light.button.text,
  },
  uploadingButton: {
    opacity: 0.7,
  },
});
