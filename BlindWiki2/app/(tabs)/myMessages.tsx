import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, ActivityIndicator, View, GestureResponderEvent } from "react-native";
import MessageComponent from "@/components/MessageView";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/models/message";
import { getMessagesFromUser, deleteMessage, updateMessageTags } from "@/services/messageService";

export default function MyMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up actions for messages
  const handleDelete = async (messageId: string) => {
    try {
      const response = await deleteMessage(messageId);
      if (response.success) {
        // Remove the deleted message from state
        setMessages(prevMessages => 
          prevMessages.filter(message => message.id !== messageId)
        );
      } else {
        console.error("Failed to delete message:", response.errorMessage);
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleEditTags = async (messageId: string, tags: string) => {
    try {
      const response = await updateMessageTags(messageId, tags);
      if (response.success) {
        // Refresh the messages to show updated tags
        fetchUserMessages();
      } else {
        console.error("Failed to update tags:", response.errorMessage);
      }
    } catch (err) {
      console.error("Error updating tags:", err);
    }
  };

  // Action handlers that match the MessageActions interface
  const myMessagesActions = {
    onListen: (event: GestureResponderEvent) => {
      // Here you would actually get the message ID from the currently selected message
      // or perhaps from a data attribute on the button
      console.log("Listen to message");
    },
    onEditTags: (event: GestureResponderEvent) => {
      console.log("Edit tags for message");
    },
    onDelete: (event: GestureResponderEvent) => {
      // In a real implementation, you would get the messageId somehow
      // For now, we'll just log
      console.log("Delete message");
    },
    onViewComments: (event: GestureResponderEvent) => {
      console.log("View comments for message");
    },
    onDirection: undefined,
  };

  // Function to fetch user messages
  const fetchUserMessages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getMessagesFromUser(user.id);
      
      if (response.success) {
        setMessages(response.messages);
      } else {
        setError(response.errorMessage || "Failed to fetch messages");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages when component mounts
  useEffect(() => {
    fetchUserMessages();
  }, [user]); // Re-fetch if user changes

  // If user is not logged in
  if (!user) {
    return <Text>Please log in to view your messages.</Text>;
  }

  // Show loading indicator while fetching messages
  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.light.primary} />;
  }

  // Show error message if there was an error fetching messages
  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {messages.map((message) => (
        <MessageComponent
          m={message}
          key={message.id}
          actions={myMessagesActions}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    margin: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
