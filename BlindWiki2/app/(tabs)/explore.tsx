import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import LocationComponent from "@/components/Location";
import TagsView from "@/components/tags/TagsView";
import { getMessages } from "@/services/messageService";
import { Message } from "@/models/message";
import { useTranslation } from "react-i18next";
import { useLocation } from "@/contexts/LocationContext";
import Colors from "@/constants/Colors";
import React from "react";

export default function Explore() {
  const { t } = useTranslation();
  const { location, isLoading: isLoadingLocation, getCurrentLocation } = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages when location is available
  useEffect(() => {
    const loadMessages = async () => {
      if (!location) return;

      setIsLoadingMessages(true);
      setError(null);

      try {
        const response = await getMessages({
          lat: location.coords.latitude.toString(),
          long: location.coords.longitude.toString(),
          dist: "1000", // 1km radius
        });

        if (response.success) {
          // Asegurar que cada mensaje tenga un ID único
          const uniqueMessages = response.messages.reduce(
            (acc: Message[], message) => {
              const existingIndex = acc.findIndex((m) => m.id === message.id);
              if (existingIndex === -1) {
                acc.push(message);
              }
              return acc;
            },
            []
          );

          setMessages(uniqueMessages);
        } else {
          setError(response.errorMessage || t("explore.error"));
        }
      } catch (err) {
        setError(t("explore.error"));
        console.error("Error loading messages:", err);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [location]);

  return (
    <ScrollView style={styles.container}>
      <LocationComponent />
      {isLoadingLocation || !location ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.activityIndicator} />
        </View>
      ) : isLoadingMessages ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.activityIndicator} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : messages.length === 0 ? (
        <Text style={styles.errorText}>{t("explore.noMessages")}</Text>
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
    marginTop: 40,
    fontSize: 20,
    color: Colors.light.text,
  },
});
