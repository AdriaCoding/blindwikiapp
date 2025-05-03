import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "@/contexts/LocationContext";
import Colors from "@/constants/Colors";

export default function LocationComponent() {
  const { t } = useTranslation();
  const [locationText, setLocationText] = useState<string | null>(null);
  
  // Get access to the location context
  const locationContext = useLocation();
  const { getCurrentLocation, location, isLoading, setLocation,error } = locationContext;

  // Function to get the current location
  const handleGetLocation = async () => {
    const result = await getCurrentLocation(t);
    console.log("Result of getCurrentLocation: ", result);
    if ('error' in result) {
      // Error is already set in context
    } else if (result.success && result.locationText) {
      setLocationText(result.locationText);
    }
  };

  // Get location if not already loaded
  useEffect(() => {
    if (!location && !isLoading) {
      handleGetLocation();
    }
  }, []);

  // Refresh location when box is pressed
  const pressLocationHandler = () => {
    setLocation(null);
    handleGetLocation();
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
      {!location || isLoading ? (
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
