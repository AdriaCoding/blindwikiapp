import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, GestureResponderEvent, Alert, Linking, Platform } from "react-native";
import StyledButton from "./StyledButton";
import AudioButton from "./AudioButton";
import { Message } from "@/models/message";
import Colors from "@/constants/Colors";
import { deleteMessage, updateMessageTags, audioPlayed, getMessages, processAudioWithSeamlessServer } from '@/services/messageService';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from "react-i18next";
import { Tag } from "@/models/tag";

// Message Actions Interface
export interface MessageActions {
  onListen?: (event: GestureResponderEvent) => void;
  onEditTags?: (event: GestureResponderEvent) => void;
  onDelete?: (event: GestureResponderEvent) => void;
  onViewComments?: (event: GestureResponderEvent) => void;
  onDirection?: (event: GestureResponderEvent) => void;
  onViewTranscription?: (event: GestureResponderEvent) => void;
  onOpenAudioTranslationModal?: (event: GestureResponderEvent) => void;
}

/**
 * Custom hook for handling message-related actions
 */
export function useMessageActions(
  messages: Message[], 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  onRefresh?: () => Promise<void>
) {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isTagsModalVisible, setIsTagsModalVisible] = useState(false);
  
  // Estado para el modal de comentarios
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [commentingMessage, setCommentingMessage] = useState<Message | null>(null);

  // States for the new audio processing modal
  const [isAudioTranslationModalVisible, setIsAudioTranslationModalVisible] = useState(false);
  const [currentProcessingMessage, setCurrentProcessingMessage] = useState<Message | null>(null);
  // Store translated URIs: key is original message ID
  const [translatedAudioUriMap, setTranslatedAudioUriMap] = useState<Record<string, string | null>>({});
  // Track pending translations: key is original message ID
  const [isTranslationPendingMap, setIsTranslationPendingMap] = useState<Record<string, boolean>>({});
  // Track translation errors: key is original message ID
  const [translationErrorMap, setTranslationErrorMap] = useState<Record<string, string | null>>({});

  /**
   * Handle message deletion
   */
  const handleDelete = async (messageId: string) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await deleteMessage(messageId);
      
      if (response.success) {
        // Update the local state by removing the deleted message
        setMessages(prev => prev.filter(message => message.id !== messageId));
        return true;
      } else {
        setError(response.errorMessage || "Failed to delete message");
        return false;
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error deleting message:", err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Open the tags edit modal for a message
   */
  const openTagsEditModal = (message: Message) => {
    setEditingMessage(message);
    setIsTagsModalVisible(true);
  };

  /**
   * Open the comments modal for a message
   */
  const openCommentsModal = (message: Message) => {
    setCommentingMessage(message);
    setIsCommentsModalVisible(true);
  };

  /**
   * Handle refreshing a message to get updated comments
   */
  const refreshMessageComments = async () => {
    if (!commentingMessage) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Obtener mensaje actualizado para obtener comentarios recientes
      const response = await getMessages({ customParams: { message_id: commentingMessage.id } });
      
      if (response.success && response.messages.length > 0) {
        const updatedMessage = response.messages[0];
        
        // Actualizar mensaje en el estado local
        setMessages(prev => prev.map(message => 
          message.id === updatedMessage.id ? updatedMessage : message
        ));
        
        // Actualizar mensaje en modal
        setCommentingMessage(updatedMessage);
        
        if (onRefresh) {
          await onRefresh();
        }
        
        return true;
      } else {
        setError(response.errorMessage || t("message.failedToRefreshComments"));
        return false;
      }
    } catch (err) {
      setError(t("message.unexpectedError"));
      console.error("Error refreshing message comments:", err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle updating message tags
   */
  const handleSaveTags = async (tags: Tag[]) => {
    if (!editingMessage) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Convertir etiquetas a cadena separada por comas para la API
      const tagsString = tags.map(tag => tag.name).join(", ");
      
      const response = await updateMessageTags(editingMessage.id, tagsString);
      
      if (response.success) {
        // Actualizar el mensaje localmente con las nuevas etiquetas
        setMessages(prev => prev.map(message => 
          message.id === editingMessage.id 
            ? { ...message, tags: tags, tagsText: tagsString } 
            : message
        ));
        
        if (onRefresh) {
          await onRefresh();
        }
        
        return true;
      } else {
        setError(response.errorMessage || t("message.failedToUpdateTags"));
        return false;
      }
    } catch (err) {
      setError(t("message.unexpectedError"));
      console.error("Error updating message tags:", err);
      return false;
    } finally {
      setIsProcessing(false);
      setEditingMessage(null);
    }
  };

  /**
   * Handle audio playback and notify the server
   */
  const handleAudioPlayback = async (message: Message, isPlaying: boolean) => {
    if (isPlaying) {
      setPlayingMessageId(message.id);
      
      // Notify server that audio was played if there's an audio attachment
      const audioAttachment = message.attachments?.find(att => att.type === 'audio');
      if (audioAttachment && audioAttachment.id) {
        try {
          await audioPlayed(audioAttachment.id);
        } catch (error) {
          console.error("Failed to notify server about audio playback:", error);
        }
      }
    } else {
      setPlayingMessageId(null);
    }
  };

  /**
   * Get audio URL from message attachments
   */
  const getAudioUrl = (message: Message): string | null => {
    const audioAttachment = message.attachments?.find(att => att.type === 'audio');
    return audioAttachment?.url || audioAttachment?.externalUrl || null;
  };

  /**
   * Handle opening directions to a message location in maps app
   */
  const handleDirections = (message: Message) => {
    const { latitude, longitude } = message;
    console.log("Navigating to coordinates:", latitude, longitude);
    
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q='
    });
    
    const latLng = `${latitude},${longitude}`;
    const label = message.address || "Mensaje de BlindWiki";
    
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    
    Linking.canOpenURL(url!)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url!);
        } else {
          // Fallback para abrir en navegador si la app de mapas no está disponible
          const browser_url = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
          return Linking.openURL(browser_url);
        }
      })
      .catch(err => console.error('Error abriendo el mapa:', err));
  };

  const processAndSaveAudio = useCallback(async (messageToProcess: Message) => {
    if (!messageToProcess || !messageToProcess.id) return;
    const messageId = messageToProcess.id;

    // If already pending, do nothing
    if (isTranslationPendingMap[messageId]) return;
    // If already processed, do nothing (this check also happens in openAudioTranslationModal)
    if (translatedAudioUriMap[messageId]) return; 

    const audioAttachment = messageToProcess.attachments?.find(att => att.type === 'audio');
    const originalAudioUrl = audioAttachment?.url || audioAttachment?.externalUrl;

    if (!originalAudioUrl) {
      setTranslationErrorMap(prev => ({ ...prev, [messageId]: t("message.noAudioForProcessing") }));
      return;
    }

    setIsTranslationPendingMap(prev => ({ ...prev, [messageId]: true }));
    setTranslationErrorMap(prev => ({ ...prev, [messageId]: null }));
    setIsProcessing(true); // Global processing indicator

    try {
      const originalFilenameWithQuery = originalAudioUrl.substring(originalAudioUrl.lastIndexOf('/') + 1);
      const originalFilename = originalFilenameWithQuery.split('?')[0];
      const extension = originalFilename.split('.').pop() || 'mp3';
      const baseFilename = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
      
      const downloadedOriginalUri = FileSystem.cacheDirectory + `temp_original_${messageId}_${originalFilename}`;
      console.log(`Downloading original audio from ${originalAudioUrl} to ${downloadedOriginalUri}`);
      const downloadResult = await FileSystem.downloadAsync(originalAudioUrl, downloadedOriginalUri);

      if (downloadResult.status !== 200) {
        throw new Error(t("message.failedToDownloadAudio"));
      }
      console.log('Original download complete, URI:', downloadResult.uri);

      const serviceResponse = await processAudioWithSeamlessServer(downloadResult.uri);
      // Clean up downloaded original file after processing
      await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });

      if (serviceResponse.success && serviceResponse.audioBlob) {
        const translatedFilename = `${baseFilename}_translated.${extension}`;
        const translatedLocalUri = FileSystem.documentDirectory + translatedFilename; // Save in a more persistent location
        
        // Convert Blob to base64 string to save with FileSystem
        const reader = new FileReader();
        reader.readAsDataURL(serviceResponse.audioBlob);
        await new Promise<void>((resolve, reject) => {
          reader.onloadend = async () => {
            try {
              if (typeof reader.result === 'string') {
                const base64Data = reader.result.split(',')[1];
                await FileSystem.writeAsStringAsync(translatedLocalUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
                setTranslatedAudioUriMap(prev => ({ ...prev, [messageId]: translatedLocalUri }));
                console.log('Processed audio saved to:', translatedLocalUri);
                resolve();
              } else {
                throw new Error('Failed to read Blob as base64 string');
              }
            } catch (saveError: any) {
              console.error("Error saving processed audio:", saveError);
              setTranslationErrorMap(prev => ({ ...prev, [messageId]: saveError.message || t("message.failedToSaveProcessedAudio") }));
              reject(saveError);
            }
          };
          reader.onerror = (error) => {
            console.error("FileReader error:", error);
            setTranslationErrorMap(prev => ({ ...prev, [messageId]: t("message.failedToReadAudioBlob") }));
            reject(error);
          };
        });
      } else {
        throw new Error(serviceResponse.errorMessage || t("message.failedToProcessAudio"));
      }
    } catch (err: any) {
      console.error("Error in processAndSaveAudio:", err);
      setTranslationErrorMap(prev => ({ ...prev, [messageId]: err.message || t("message.unexpectedErrorProcessingAudio") }));
    } finally {
      setIsTranslationPendingMap(prev => ({ ...prev, [messageId]: false }));
      setIsProcessing(false); // Global processing indicator
    }
  }, [t, isTranslationPendingMap, translatedAudioUriMap]);

  const openAudioTranslationModal = (messageToProcess: Message) => {
    setCurrentProcessingMessage(messageToProcess);
    setIsAudioTranslationModalVisible(true);
    // If not already processed and not pending, start the process
    if (messageToProcess && messageToProcess.id && !translatedAudioUriMap[messageToProcess.id] && !isTranslationPendingMap[messageToProcess.id]) {
      processAndSaveAudio(messageToProcess);
    }
  };

  const closeAudioTranslationModal = () => {
    setIsAudioTranslationModalVisible(false);
    // Optionally, you might want to clear currentProcessingMessage or errors specific to it when modal closes definitely
    // setCurrentProcessingMessage(null); 
  };

  /**
   * Create MessageActions object for a specific message
   */
  const getActionsForMessage = (message: Message) => {
    return {
      onListen: (event: GestureResponderEvent) => {
        console.log("Clicked on Listen to message:", message.id);
        // This is kept for backward compatibility but actual audio
        // playback is now handled by AudioButton directly
      },
      onEditTags: (event: GestureResponderEvent) => {
        openTagsEditModal(message);
      },
      onDelete: (event: GestureResponderEvent) => {
        Alert.alert(
          "Confirm Deletion",
          "Are you sure you want to delete this message?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            { 
              text: "Delete", 
              onPress: () => handleDelete(message.id),
              style: "destructive"
            }
          ]
        );
      },
      onViewComments: (event: GestureResponderEvent) => {
        openCommentsModal(message);
      },
      onDirection: (event: GestureResponderEvent) => {
        handleDirections(message);
      },
      onViewTranscription: (event: GestureResponderEvent) => {
        // No-op or could optionally alert the transcription
      },
      onOpenAudioTranslationModal: (event: GestureResponderEvent) => {
        openAudioTranslationModal(message);
      },
    };
  };

  return {
    handleDelete,
    getActionsForMessage,
    handleAudioPlayback,
    getAudioUrl,
    handleDirections,
    playingMessageId,
    isProcessing,
    error,
    editingMessage,
    isTagsModalVisible,
    setIsTagsModalVisible,
    handleSaveTags,
    // Exports for comments modal
    commentingMessage,
    isCommentsModalVisible,
    setIsCommentsModalVisible,
    refreshMessageComments,
    // Modal related states and functions
    isAudioTranslationModalVisible,
    currentProcessingMessage,
    translatedAudioUriMap,
    isTranslationPendingMap,
    translationErrorMap,
    openAudioTranslationModal,
    closeAudioTranslationModal,
    processAndSaveAudio,
  };
}

/**
 * Message component that displays a single message with action buttons
 */
export default function MessageComponent({
  m,
  actions,
  isProcessing,
}: {
  m: Message;
  actions: MessageActions;
  isProcessing?: boolean;
}) {
  const { t } = useTranslation();
  
  // Extract audio URL from message attachments
  const audioUrl = m.attachments?.find(att => att.type === 'audio')?.url || 
                  m.attachments?.find(att => att.type === 'audio')?.externalUrl || 
                  null;
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);

  // Event handler for audio playback status changes
  const handlePlaybackStatusChange = (isPlaying: boolean) => {
    setIsPlayingAudio(isPlaying);
    // Notify the server about playback if there's an audio attachment
    if (isPlaying && m.attachments?.some(att => att.type === 'audio')) {
      const audioAttachment = m.attachments.find(att => att.type === 'audio');
      if (audioAttachment?.id) {
        audioPlayed(audioAttachment.id).catch(err => {
          console.error("Failed to notify server about audio playback:", err);
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* First line: tags */}
      <Text style={styles.tagsLine}>
        {m.tags?.map(tag => tag.name).join(", ") || ""}
      </Text>

      {/* Second line: userID in bold, then a dot, then location.
          The location can be multi-line if it's long */}
      <Text style={styles.lineTwo}>
        <Text style={styles.user}>{m.authorUser.displayName}</Text>. {m.address}
      </Text>

      {/* Action buttons */}
      {audioUrl ? (
        <AudioButton 
          audioUri={audioUrl}
          onPlaybackStatusChange={handlePlaybackStatusChange}
          style={styles.actionButton}
          context="message"
        />
      ) : actions.onListen && (
        <StyledButton 
          title={t("message.listen")} 
          onPress={actions.onListen}
          style={styles.actionButton}
        />
      )}
      
      {actions.onViewComments && (
        <StyledButton 
          title={t("message.comments")} 
          onPress={actions.onViewComments}
          style={styles.actionButton}
        />
      )}
      {actions.onEditTags && (
        <StyledButton 
          title={t("message.editTags")} 
          onPress={actions.onEditTags}
          style={styles.actionButton}
        />
      )}
      {actions.onDelete && (
        <StyledButton 
          title={t("message.delete")} 
          onPress={actions.onDelete}
          style={styles.actionButton}
        />
      )}
      {actions.onDirection && (
        <StyledButton 
          title={t("message.directions")} 
          onPress={actions.onDirection}
          style={styles.actionButton}
        />
      )}
      {actions.onViewTranscription && (
        <StyledButton 
          title={showTranscription ? t("message.hideTranscription") : t("message.viewTranscription")}
          onPress={() => setShowTranscription(v => !v)}
          style={styles.actionButton}
          accessibilityLabel={m.text ? t("message.transcription") + m.text : t("message.noTranscription")}
          accessibilityRole="button"
        />
      )}
      {showTranscription && (
        <Text style={styles.transcriptionText}>{m.text}</Text>
      )}
      {actions.onOpenAudioTranslationModal && audioUrl && (
        <StyledButton 
          title={isProcessing ? t("modal.processingAudio") : t("message.getAudioTranslation")}
          onPress={actions.onOpenAudioTranslationModal}
          style={styles.actionButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingVertical: 10,
  },
  tagsLine: {
    marginBottom: 6,
  },
  lineTwo: {
    marginBottom: 6,
  },
  user: {
    fontWeight: "bold",
  },
  actionButton: {
    marginBottom: 4,
  },
  transcriptionText: {
    marginVertical: 8,
    fontSize: 16,
    color: Colors.light.text,
  },
});
