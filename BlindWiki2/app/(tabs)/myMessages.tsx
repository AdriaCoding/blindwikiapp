import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import MessageComponent, { useMessageActions } from "@/components/MessageView";
import Colors from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/models/message";
import { getMessagesFromUser } from "@/services/messageService";
import StyledButton from "@/components/StyledButton";
import { router } from "expo-router";


export default function MyMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user messages
  const fetchUserMessages = async () => {
    if (!user) {
      return (
        setError("You must be logged in to view your messages."),
        setIsLoading(false)
      );
    }

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

  // Use our shared message actions hook
  const {
    getActionsForMessage,
    isProcessing,
    error: actionError,
  } = useMessageActions(messages, setMessages, fetchUserMessages);

  // Fetch messages when component mounts
  useEffect(() => {
    fetchUserMessages();
  }, [user]);

  // Render loading, error or empty states
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text>Loading your messages...</Text>
      </View>
    );
  }

  if (error || actionError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || actionError}</Text>
        <StyledButton
          title="Log In"
          onPress={() => router.push("/(tabs)/settings/login")}
        />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>You haven't created any messages yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {isProcessing && (
        <ActivityIndicator size="small" color={Colors.light.primary} />
      )}

      {messages.map((message) => (
        <MessageComponent
          key={message.id}
          m={message}
          actions={getActionsForMessage(message)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginBottom: 20,
    fontSize: 20,
    textAlign: "center",
  },
});
