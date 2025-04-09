import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { testSearchMessages } from "@/utils/debugMessage";
import { getSessionToken } from "@/services/secureStorage";
import { getAllSecureItems } from "@/utils/debugAuth";
import { useState } from "react";
import StyledButton from "@/components/StyledButton";
import StyledInput from "@/components/StyledInput";
import TagsView from "@/components/tags/TagsView";
import { getMessages } from "@/services/messageService";
import { Message } from "@/models/message";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/Colors";
import React from "react";
import { GOOGLE_MAPS_API_KEY } from "@env";
import { InstructionsText } from "@/components/InstructionsText";

// Interfaces para los resultados de Google Places
interface PlacePrediction {
  description: string;
  place_id: string;
}

export default function Search() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: string;
    lng: string;
    address: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mantener la función original de prueba
  const testhandler = async () => {
    try {
      const sessionId = await getSessionToken();
      getAllSecureItems();
      console.log("🔑 Session ID:", sessionId || "No session ID found");
    } catch (error) {
      console.error("Error fetching session ID:", error);
    }

    testSearchMessages();
  };

  const searchPlaces = async () => {
    if (!searchQuery.trim()) {
      return;
    }

    setIsLoadingPlaces(true);
    setError(null);
    setPredictions([]);

    try {
      // Llamar a la API de Google Autocomplete
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          searchQuery
        )}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      console.log("Resultados de la búsqueda:", data);

      if (data.predictions && data.predictions.length > 0) {
        // Guardar las predicciones para mostrarlas en la lista
        setPredictions(data.predictions);
      } else {
        setError(t("search.noResults"));
      }
    } catch (err) {
      setError(t("search.error"));
      console.error("Error buscando lugares:", err);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const selectPlace = async (placeId: string, description: string) => {
    setIsLoadingPlaces(true);

    try {
      // Obtener detalles del lugar seleccionado (coordenadas)
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}`
      );

      const detailsData = await detailsResponse.json();
      console.log("Detalles del lugar:", detailsData);

      if (detailsData.result && detailsData.result.geometry) {
        const location = detailsData.result.geometry.location;
        const address = detailsData.result.formatted_address || description;

        setSelectedLocation({
          lat: location.lat.toString(),
          lng: location.lng.toString(),
          address,
        });

        // Limpiar predicciones
        setPredictions([]);

        // Cargar mensajes para esta ubicación
        loadMessages(location.lat.toString(), location.lng.toString());
      } else {
        setError(t("search.locationError"));
      }
    } catch (err) {
      setError(t("search.error"));
      console.error("Error obteniendo detalles del lugar:", err);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const loadMessages = async (lat: string, long: string) => {
    setIsLoadingMessages(true);
    setError(null);

    try {
      const response = await getMessages({
        lat: lat,
        long: long,
        dist: "1000", // 1km radio
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
        setError(response.errorMessage || t("search.error"));
      }
    } catch (err) {
      setError(t("search.error"));
      console.error("Error cargando mensajes:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const renderPredictionItem = ({
    item,
    index,
  }: {
    item: PlacePrediction;
    index: number;
  }) => (
    <TouchableOpacity
      style={[
        styles.predictionItem,
        index === predictions.length - 1 && { borderBottomWidth: 0 },
      ]}
      onPress={() => selectPlace(item.place_id, item.description)}
    >
      <Text style={styles.predictionText}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <StyledInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.input}
          placeholder={t("search.placeholder")}
        />
        <View style={styles.buttonContainer}>
          <StyledButton
            onPress={searchPlaces}
            title={t("search.button")}
            style={styles.searchButton}
          />
          {/* Botón de prueba para verificar el sessionId y otros datos de depuración 
          <StyledButton
            onPress={testhandler}
            title="TEST"
            style={styles.testButton}
          />
          */}
        </View>
      </View>

      {/* Lista de resultados de búsqueda */}
      {predictions.length > 0 && (
        <>
          <InstructionsText>{t("search.selectLocation")}</InstructionsText>
          <View style={styles.predictionsContainer}>
            <FlatList
              data={predictions}
              renderItem={renderPredictionItem}
              keyExtractor={(item) => item.place_id}
              scrollEnabled={false}
            />
          </View>
        </>
      )}

      {selectedLocation && !isLoadingPlaces && predictions.length === 0 && (
        <Text style={styles.locationText}>{selectedLocation.address}</Text>
      )}

      {isLoadingPlaces ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.activityIndicator} />
          <Text style={styles.loadingText}>{t("search.searchingPlaces")}</Text>
        </View>
      ) : isLoadingMessages ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.activityIndicator} />
          <Text style={styles.loadingText}>{t("search.loadingMessages")}</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : messages.length > 0 && predictions.length === 0 ? (
        <TagsView messages={messages} />
      ) : selectedLocation && predictions.length === 0 ? (
        <Text style={styles.noMessagesText}>{t("search.noMessages")}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 15,
  },
  searchContainer: {
    flexDirection: "column",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  searchButton: {
    flex: 3,
    marginRight: 5,
  },
  testButton: {
    flex: 1,
  },
  predictionsContainer: {
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  predictionsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 5,
    marginTop: 5,
    color: Colors.light.text,
  },
  predictionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  predictionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  locationText: {
    marginBottom: 15,
    fontSize: 16,
    fontStyle: "italic",
    color: Colors.light.text,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    textAlign: "center",
    color: Colors.light.text,
  },
  errorText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.light.text,
  },
  noMessagesText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.light.text,
  },
});
