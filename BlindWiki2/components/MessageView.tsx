import React, { useState } from "react";
import { View, Text, StyleSheet, GestureResponderEvent, Alert } from "react-native";
import StyledButton from "./StyledButton";
import { Message } from "@/models/message";
import Colors from "@/constants/Colors";
import { deleteMessage, updateMessageTags } from '@/services/messageService';
// Message Actions Interface
export interface MessageActions {
  onListen?: (event: GestureResponderEvent) => void;
  onEditTags?: (event: GestureResponderEvent) => void;
  onDelete?: (event: GestureResponderEvent) => void;
  onViewComments?: (event: GestureResponderEvent) => void;
  onDirection?: (event: GestureResponderEvent) => void;
}

/**
 * Custom hook for handling message-related actions
 */
export function useMessageActions(
  messages: Message[], 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  onRefresh?: () => Promise<void>
) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
   * Handle updating message tags
   */
  const handleEditTags = async (messageId: string, tags: string) => {
    console.log("Clicked on Updating tags for message:", messageId, tags);
  };

  /**
   * Create MessageActions object for a specific message
   */
  const getActionsForMessage = (message: Message) => {
    return {
      onListen: (event: GestureResponderEvent) => {
        console.log("Clicked on Listen to message:", message.id);
        // Implement audio playback logic
      },
      onEditTags: (event: GestureResponderEvent) => {
        console.log("Clicked on Edit tags for message:", message.id);
        // You would show a modal or navigate to edit tags screen, then call handleEditTags
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
        console.log("Clicked on View comments for message:", message.id);
        // Navigate to comments screen
      },
      onDirection: undefined, // Implement if needed
    };
  };

  return {
    handleDelete,
    handleEditTags,
    getActionsForMessage,
    isProcessing,
    error,
  };
}

/**
 * Message component that displays a single message with action buttons
 */
export default function MessageComponent({
  m,
  actions,
}: {
  m: Message;
  actions: MessageActions;
}) {
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

      {/* Black buttons for actions */}
      {actions.onListen && (
        <StyledButton title="Listen" onPress={actions.onListen} />
      )}
      {actions.onViewComments && (
        <StyledButton title="Comments" onPress={actions.onViewComments} />
      )}
      {actions.onEditTags && (
        <StyledButton title="Edit Tags" onPress={actions.onEditTags} />
      )}
      {actions.onDelete && (
        <StyledButton title="Delete" onPress={actions.onDelete} />
      )}
      {actions.onDirection && (
        <StyledButton title="Direction" onPress={actions.onDirection} />
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
});
