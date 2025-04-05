import React from "react";
import { StyleSheet, ScrollView, View, Text, ActivityIndicator } from "react-native";
import TagsView, { TagsList } from "@/components/TagsView";
import { useState, useEffect } from "react";
import { Area } from "@/models/area";
import { Tag } from "@/models/tag";
import { getMessages } from "@/services/messageService";
import { getAreas } from "@/services/areaService";
import { Message } from "@/models/message";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/Colors";

export default function World() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Tag | null>(null);

  useEffect(() => {
    const loadAreas = async () => {
      setIsLoadingAreas(true);
      setError(null);

      try {
        const response = await getAreas();
        if (response.success) {
          setAreas(response.areas);
        } else {
          setError(response.errorMessage || t("world.error"));
        }
      } catch (err) {
        setError(t("world.error"));
        console.error("Error loading areas:", err);
      } finally {
        setIsLoadingAreas(false);
      }
    };

    loadAreas();
  }, []);
  
  function areaToTag(area: Area): Tag {
    return {
      id: area.id.toString(),
      name: area.displayName,
      asString: area.name
    };
  }
  
  const areasAsTags = areas.map((a) => areaToTag(a));

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedArea) {
        setMessages([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getMessages({
          area: selectedArea.asString,
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
          setError(response.errorMessage || t("world.error"));
        }
      } catch (err) {
        setError(t("world.error"));
        console.error("Error loading messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [selectedArea]);

  function chosenAreaHandler(area: Tag) {
    setSelectedArea(prev => {
      // Si el área ya estaba seleccionada, la deseleccionamos
      if (prev?.id === area.id) {
        // Actualizar la propiedad selected del área actual
        const updatedArea = areasAsTags.find(a => a.id === area.id);
        if (updatedArea) {
          updatedArea.selected = false;
        }
        return null;
      } 
      // Si hay un área seleccionada, la deseleccionamos primero
      if (prev) {
        const previousArea = areasAsTags.find(a => a.id === prev.id);
        if (previousArea) {
          previousArea.selected = false;
        }
      }
      // Seleccionamos la nueva área
      const updatedArea = areasAsTags.find(a => a.id === area.id);
      if (updatedArea) {
        updatedArea.selected = true;
      }
      return area;
    });
  }

  return (
    <ScrollView style={styles.container}>
      {isLoadingAreas ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <TagsList
            tags={areasAsTags}
            onTagPress={chosenAreaHandler}
          />
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            messages.length > 0 && <TagsView messages={messages} />
          )}
        </>
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
