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
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagInput, setNewTagInput] = useState("");
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  
  // Pre-fill address if available from context
  const addressText = 
    address ? 
    `${address.street || ""} ${address.city || ""}, ${address.country || ""}`.trim() : 
    ""
  const [isUploading, setIsUploading] = useState(false);

  // Load proposed tags on component mount
  useEffect(() => {
    const loadProposedTags = async () => {
      setIsLoadingTags(true);
      try {
        const response = await getProposedTags();
        if (response.success) {
          setAllTags(response.tags);
          // Select all proposed tags by default
          setSelectedTagIds(new Set(response.tags.map(tag => tag.id)));
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

  // Handle tag selection/deselection
  const handleTagSelect = (tag: Tag) => {
    setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag.id)) {
        newSet.delete(tag.id);
      } else {
        newSet.add(tag.id);
      }
      return newSet;
    });
  };

  // Handle adding new custom tags
  const handleAddCustomTag = () => {
    if (!newTagInput.trim()) return;

    const customTags = newTagInput.split(",").map(t => t.trim()).filter(t => t);
    const newCustomTags: Tag[] = customTags.map(tagName => ({
      id: `custom-${tagName}-${Date.now()}`,
      name: tagName,
      asString: tagName
    }));

    // Add to all tags and select them
    setAllTags(prev => [...prev, ...newCustomTags]);
    setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      newCustomTags.forEach(tag => newSet.add(tag.id));
      return newSet;
    });

    // Clear input
    setNewTagInput("");
  };

  // Get selected tags as string for API
  const getSelectedTagsString = () => {
    return Array.from(selectedTagIds)
      .map(id => allTags.find(tag => tag.id === id)?.name)
      .filter((name): name is string => name !== undefined)
      .join(", ");
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
      
      <Text style={styles.label}>{t("edit.tagsLabel")}</Text>
      
      {/* Tags Section */}
      {isLoadingTags ? (
        <Text style={styles.loadingText}>{t("edit.loadingTags")}</Text>
      ) : allTags.length > 0 ? (
        <View style={styles.tagsContainer}>
          <InstructionsText style={styles.tagsLabel}>{t("edit.proposedTagsInstructions")}</InstructionsText>
          <TagsList
            tags={allTags}
            selectedTags={allTags.filter(tag => selectedTagIds.has(tag.id))}
            onTagPress={handleTagSelect}
          />
        </View>
      ) : null}
      
      <InstructionsText>{t("edit.additionalTagsInstructions")}</InstructionsText>
      
      {/* Custom Tags Input Section */}
      <View style={styles.customTagsContainer}>
        <StyledInput
          value={newTagInput}
          onChangeText={setNewTagInput}
          multiline={false}
          maxLength={100}
          numberOfLines={1}
          style={styles.customTagInput}
        />
        <StyledButton
          title={t("edit.addTags")}
          onPress={handleAddCustomTag}
          style={styles.addTagButton}
          textStyle={styles.addTagButtonText}
        />
      </View>
      
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
  tagsContainer: {
    marginBottom: 12,
  },
  tagsLabel: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
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
    backgroundColor: Colors.light.button.background,
  },
  publishButtonText: {
    color: Colors.light.button.text,
  },
  uploadingButton: {
    opacity: 0.7,
  },
});
