import { StyleSheet, View, TextInput, Text, Alert, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect, useRef } from "react";
import StyledInput from "@/components/StyledInput";
import { useLocalSearchParams, router } from "expo-router";
import StyledButton from "@/components/StyledButton";
import { useTranslation } from "react-i18next";
import { publishMessage } from "@/services/messageService";
import Colors from "@/constants/Colors";
import { useLocation } from "@/contexts/LocationContext";
import AudioButton from "@/components/AudioButton";
import { InstructionsText } from "@/components/StyledText";
import { getProposedTags } from "@/services/tagService";
import { Tag } from "@/models/tag";
import { TagsList } from "@/components/TagsView";
import TagsEdit from "@/components/TagsEdit";

export default function EditScreen() {
  const { t } = useTranslation();
  const { location, address } = useLocation();
  const params = useLocalSearchParams<{
    recordingUri: string;
    latitude: string;
    longitude: string;
  }>();

  // Store recording URI directly
  const [recordingUri] = useState<string>(params.recordingUri || "");
  
  // Reference to the AudioButton component for controlling playback externally
  const audioButtonRef = useRef(null);
  
  // Playback state tracking
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use params for latitude/longitude if provided, otherwise use context
  const [latitude] = useState<string>(
    params.latitude || location?.coords.latitude?.toString() || ""
  );
  const [longitude] = useState<string>(
    params.longitude || location?.coords.longitude?.toString() || ""
  );
  
  // Tags state
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  
  // Pre-fill address if available from context
  const addressText = 
    address ? 
    `${address.street || ""} ${address.city || ""}, ${address.country || ""}`.trim() : 
    ""
  const [isUploading, setIsUploading] = useState(false);

  // Show quick publish alert on mount
  useEffect(() => {
    Alert.alert(
      t("edit.quickPublishTitle"),
      "",
      [
        {
          text: t("edit.quickPublishChangeTags"),
          style: "cancel"
        },
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () => router.back()
        },
        {
          text: t("edit.publishButton"),
          onPress: handlePublish
        }
      ]
    );
  }, []);

  // Load proposed tags on component mount
  useEffect(() => {
    const loadProposedTags = async () => {
      setIsLoadingTags(true);
      try {
        const response = await getProposedTags();
        if (response.success) {
          setAllTags(response.tags);
        } else {
          console.error("Error loading proposed tags:", response.errorMessage);
        }
      } catch (error) {
        console.error("Error loading proposed tags:", error);
      } finally {
        setIsLoadingTags(false);
      }
    };

    loadProposedTags();
  }, []);

  const getSelectedTagsString = () => {
    const selectedTags = allTags.filter(tag => tag.selected === true);
    return selectedTags.map(tag => tag.name).join(", ");
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
        getSelectedTagsString()
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
      <AudioButton 
        audioUri={recordingUri}
        autoPlay={true}
        onPlaybackStatusChange={setIsPlaying}
      />
      
      <Text style={styles.title}>{t("edit.tagsLabel")}</Text>
      <TagsEdit
        allTags={allTags}
        onTagsChange={setAllTags}
        isLoadingTags={isLoadingTags}
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  tagListContainer: {
    marginBottom: 12,
  },
  loadingText: {
    color: Colors.light.text,
    fontSize: 14,
    marginBottom: 12,
  },
  customTagsContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  customTagInput: {
    width: "100%",
  },
  addTagButton: {
    paddingHorizontal: 16,
    height: 40,
    backgroundColor: Colors.light.button.background,
  },
  addTagButtonText: {
    color: Colors.light.button.text,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: Colors.light.button.background,
  },
  cancelButtonText: {
    color: Colors.light.button.text,
  },
  publishButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: Colors.light.button.background,
  },
  publishButtonText: {
    color: Colors.light.button.text,
  },
  uploadingButton: {
    opacity: 0.7,
  },
});
