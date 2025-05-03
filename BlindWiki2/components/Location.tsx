import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "@/contexts/LocationContext";
import Colors from "@/constants/Colors";

export default function LocationComponent() {
  const { t } = useTranslation();
  
  // Get access to the location context, including locationText
  const locationContext = useLocation();
  const { getCurrentLocation, location, isLoading, setLocation, error, locationText } = locationContext;

  // Function to get the current location - no longer sets local state
  const handleGetLocation = async () => {
    await getCurrentLocation(t);
    // No need to set local state here
  };

  // Get location if not already loaded
  useEffect(() => {
    // Fetch location if we don't have the location object OR the locationText
    if ((!location || !locationText) && !isLoading) {
      handleGetLocation();
    }
  }, [location, locationText, isLoading]); // Add locationText to dependency array

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
        locationText // Use locationText from context
          ? t("location.currentLocation") + locationText
          : error || t("location.loading")
      }
    >
      {isLoading ? ( // Simplify check: only isLoading matters for the indicator
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors.light.activityIndicator}
          />
          <Text style={styles.loadingText}>{t("location.loading")}</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : locationText ? ( // Show text directly from context
        <Text style={styles.locationText}>{locationText}</Text>
      ) : (
        // Fallback if still loading text for some reason (or initial state)
        <Text style={styles.locationText}>
            {t("location.getLocationPrompt", "Tap to get location")} 
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
