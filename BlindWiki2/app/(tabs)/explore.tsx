import { StyleSheet, ScrollView, View, Text, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import Location from "@/components/Location";
import TagsView from "@/components/tags/TagsView";
import { getMessages } from "@/services/messageService";
import { Message } from "@/models/message";
import { useTranslation } from "react-i18next";
import { useLocation } from "@/contexts/LocationContext";
import Colors from "@/constants/Colors";

export default function Explore() {
  const { t } = useTranslation();
  const { location } = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!location) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await getMessages({
          lat: location.coords.latitude.toString(),
          long: location.coords.longitude.toString(),
          dist: "1000", // 1km radius
        });

        if (response.success) {
          // Asegurar que cada mensaje tenga un ID único
          const uniqueMessages = response.messages.reduce((acc: Message[], message) => {
            const existingIndex = acc.findIndex(m => m.id === message.id);
            if (existingIndex === -1) {
              acc.push(message);
            }
            return acc;
          }, []);
          
          setMessages(uniqueMessages);
        } else {
          setError(response.errorMessage || t("explore.error"));
        }
      } catch (err) {
        setError(t("explore.error"));
        console.error("Error loading messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [location]);

  return (
    <ScrollView style={styles.container}>
      <Location />
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <TagsView messages={messages} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.light.text,
  },
});
