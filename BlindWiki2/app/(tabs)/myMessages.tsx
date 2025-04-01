import { useState, useEffect, useCallback } from "react";
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
import { useTranslation } from "react-i18next";

export default function MyMessages() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(true);

  // Function to fetch user messages
  const fetchUserMessages = useCallback(async () => {
    if (!user) {
      setError(t("myMessages.error.notLoggedIn"));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getMessagesFromUser(user.id);

      if (!isMounted) return;

      if (response.success) {
        setMessages(response.messages);
      } else {
        setError(response.errorMessage || t("myMessages.error.fetchFailed"));
      }
    } catch (err) {
      if (!isMounted) return;
      setError(t("myMessages.error.unexpected"));
      console.error("Error fetching messages:", err);
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, [user, t, isMounted]);

  // Use our shared message actions hook
  const {
    getActionsForMessage,
    isProcessing,
    error: actionError,
  } = useMessageActions(messages, setMessages, fetchUserMessages);

  // Fetch messages when component mounts
  useEffect(() => {
    setIsMounted(true);
    fetchUserMessages();

    return () => {
      setIsMounted(false);
    };
  }, [fetchUserMessages]);

  // Render loading, error or empty states
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text>{t("myMessages.loading")}</Text>
      </View>
    );
  }

  if (error || actionError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || actionError}</Text>
        <StyledButton
          title={t("login.title")}
          onPress={() => router.push("/login")}
        />
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>{t("myMessages.noMessages")}</Text>
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
