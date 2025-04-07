import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "@/contexts/LocationContext";
import Colors from "@/constants/Colors";
export default function LocationComponent() {
  const { t } = useTranslation();
  const [locationText, setLocationText] = useState<string | null>(null);
  const [loading, setLoading] = useState(Platform.OS !== 'web');
  const [error, setError] = useState<string | null>(null);
  
  // Get access to the location context
  const locationContext = useLocation();

  const parseLocationText = (
    address: Location.LocationGeocodedAddress,
    position: Location.LocationObject
  ): string => {
    const accuracy = position.coords.accuracy ?? 0;
    const isHighAccuracy = accuracy < 20;
    return `${address.street || ""}, ${address.district || ""}, ${
      address.postalCode || ""
    } ${address.city || ""}, ${address.country || ""} : ${
      isHighAccuracy ? t("location.highAccuracy") : t("location.normalAccuracy")
    }`;
  };
  
  // Function to get the current location
  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError(t("location.permissionDenied"));
        setLoading(false);
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Get address from coordinates (reverse geocoding)
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (addressResponse && addressResponse.length > 0) {
        const address = addressResponse[0];
        const locationText = parseLocationText(address, position);
        setLocationText(locationText);
        
        // Update the location context
        locationContext.updateLocation(position, address);
      } else {
        // Fallback to coordinates if geocoding fails
        setLocationText(
          `${position.coords.latitude.toFixed(
            6
          )}, ${position.coords.longitude.toFixed(6)}`
        );
        
        // Update the location context with position only
        locationContext.updateLocation(position);
      }
    } catch (err) {
      setError(t("location.error"));
      console.error("Error getting location:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get location when component mounts (solo en móvil)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      getCurrentLocation();
    }
  }, []);

  // Handle press on location box
  const pressLocationHandler = () => {
    getCurrentLocation(); // Refresh location on press
  };

  return (
    <Pressable
      style={[styles.outerBox, error ? styles.errorBox : {}]}
      onPress={pressLocationHandler}
      accessibilityLabel={
        locationText
          ? t("location.currentLocation") + locationText
          : error || t("location.loading")
      }
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.activityIndicator} />
          <Text style={styles.loadingText}>{t("location.loading")}</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : locationText ? (
        <Text style={styles.locationText}>{locationText}</Text>
      ) : (
        <Text style={styles.locationText}>
          {Platform.OS === 'web' 
            ? t("location.clickToGetLocation") 
            : t("location.loading")}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outerBox: {
    alignSelf: "center",
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    padding: 25,
    marginVertical: 10,
  },
  errorBox: {
    borderColor: "red",
  },
  text: {
    textAlign: "center",
    fontSize: 17,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontSize: 17,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  locationText: {
    textAlign: "center",
    fontSize: 17,
  },
});
