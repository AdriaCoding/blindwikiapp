import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "@/contexts/LocationContext";
import Colors from "@/constants/Colors";

const requestLocationPermission = async (t: (key: string) => string) => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status == "granted") return true;
  else {
    Alert.alert(
      t("location.permissionRequired"),
      t("location.permissionExplanation"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("location.openSettings"),
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
    const statusAfterRequest = await Location.getForegroundPermissionsAsync();
    if (statusAfterRequest.status == "granted") {
      return true;
    }
    return false;
  }
};

export const getCurrentLocation = async (t: (key: string) => string, locationContext: any) => {
  try {
    // Request permissions
    const hasPermission = await requestLocationPermission(t);
    if (!hasPermission) {
      return { error: t("location.permissionDenied") };
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
      const locationText = `${address.street || ""}, ${address.district || ""}, ${
        address.postalCode || ""
      } ${address.city || ""}, ${address.country || ""}`;
      
      // Update the location context
      locationContext.updateLocation(position, address);
      
      return { 
        success: true, 
        position, 
        address, 
        locationText 
      };
    } else {
      // Fallback to coordinates if geocoding fails
      const locationText = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
      
      // Update the location context with position only
      locationContext.updateLocation(position);
      
      return { 
        success: true, 
        position, 
        locationText 
      };
    }
  } catch (err) {
    console.error("Error getting location:", err);
    return { error: t("location.error") };
  }
};

export default function LocationComponent() {
  const { t } = useTranslation();
  const [locationText, setLocationText] = useState<string | null>(null);
  const [loading, setLoading] = useState(Platform.OS !== "web");
  const [error, setError] = useState<string | null>(null);
  
  // Get access to the location context
  const locationContext = useLocation();

  // Function to get the current location
  const handleGetLocation = async () => {
    setLoading(true);
    setError(null);

    const result = await getCurrentLocation(t, locationContext);
    
    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setLocationText(result.locationText);
    }
    
    setLoading(false);
  };

  // Get location when component mounts (solo en móvil)
  useEffect(() => {
    if (Platform.OS !== "web") {
      handleGetLocation();
    }
  }, []);

  // Handle press on location box
  const pressLocationHandler = () => {
    handleGetLocation(); // Refresh location on press
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
          <ActivityIndicator
            size="large"
            color={Colors.light.activityIndicator}
          />
          <Text style={styles.loadingText}>{t("location.loading")}</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : locationText ? (
        <Text style={styles.locationText}>{locationText}</Text>
      ) : (
        <Text style={styles.locationText}>
          {Platform.OS === "web"
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
