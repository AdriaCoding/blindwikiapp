import { createContext, useContext, useState, ReactNode } from "react";
import * as ExpoLocation from "expo-location";
import { Alert, Linking, Platform } from "react-native";

// Define result types for better type checking
type LocationSuccessResult = {
  success: true;
  position: ExpoLocation.LocationObject;
  address?: ExpoLocation.LocationGeocodedAddress;
  locationText?: string;
};

type LocationErrorResult = {
  error: string;
  success?: false;
};

type LocationResult = LocationSuccessResult | LocationErrorResult;

// Define the shape of the context data
type LocationContextType = {
  location: ExpoLocation.LocationObject | null;
  setLocation: (location: ExpoLocation.LocationObject | null) => void;
  address: ExpoLocation.LocationGeocodedAddress | null;
  isLoading: boolean;
  error: string | null;
  updateLocation: (
    newLocation: ExpoLocation.LocationObject, 
    newAddress?: ExpoLocation.LocationGeocodedAddress
  ) => void;
  clearError: () => void;
  getCurrentLocation: (t: (key: string) => string) => Promise<LocationResult>;
  fetchLocationWithoutRequestingPermisisons: () => Promise<void>;
};

// Create the context with a default undefined value
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Provider component that wraps parts of the app that need location data
export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<ExpoLocation.LocationObject | null>(null);
  const [address, setAddress] = useState<ExpoLocation.LocationGeocodedAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to update location data from components
  const updateLocation = (
    newLocation: ExpoLocation.LocationObject, 
    newAddress?: ExpoLocation.LocationGeocodedAddress
  ) => {
    setLocation(newLocation);
    if (newAddress) {
      setAddress(newAddress);
    }
  };

  // Function to clear error state
  const clearError = () => {
    setError(null);
  };

  // Base function to request location permission
  const requestLocationPermission = async (t: (key: string) => string): Promise<boolean> => {
    const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status === "granted") return true;
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
      const statusAfterRequest = await ExpoLocation.getForegroundPermissionsAsync();
      if (statusAfterRequest.status === "granted") {
        return true;
      }
      return false;
    }
  };

  // Core function to fetch location data and update context
  const fetchLocationData = async (t?: (key: string) => string): Promise<LocationResult> => {
    try {
      // Get current position
      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      try {
        // Get address from coordinates (reverse geocoding)
        const addressResponse = await ExpoLocation.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (addressResponse && addressResponse.length > 0) {
          const addressData = addressResponse[0];
          // Update the location context
          updateLocation(position, addressData);
          
          if (t) {
            const locationText = `${addressData.street || ""}, ${addressData.district || ""}, ${
              addressData.postalCode || ""
            } ${addressData.city || ""}, ${addressData.country || ""}`;
            
            return { 
              success: true, 
              position, 
              address: addressData, 
              locationText 
            };
          }
          return { success: true, position, address: addressData };
        } else {
          // Update the location context with position only
          updateLocation(position);
          
          if (t) {
            // Fallback to coordinates if geocoding fails
            const locationText = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
            return { success: true, position, locationText };
          }
          return { success: true, position };
        }
      } catch (err) {
        // If geocoding fails, at least update with position
        updateLocation(position);
        if (t) {
          const locationText = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          return { success: true, position, locationText };
        }
        return { success: true, position };
      }
    } catch (err) {
      console.error("Error getting location data:", err);
      return { error: t ? t("location.error") : "Error getting location" };
    }
  };

  // Public function that requests permissions if needed
  const getCurrentLocation = async (t: (key: string) => string): Promise<LocationResult> => {
    setIsLoading(true);
    try {
      // Request permissions
      const hasPermission = await requestLocationPermission(t);
      if (!hasPermission) {
        setError(t("location.permissionDenied"));
        return { error: t("location.permissionDenied") };
      }
      
      // Use core function to get location data
      setError(null);
      const result = await fetchLocationData(t);
      
      if ('error' in result) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      console.error("Error getting location:", err);
      const errorMsg = t("location.error");
      setError(errorMsg);
      return { error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Function that only fetches location if permission is already granted
  const fetchLocationWithoutRequestingPermisisons = async (): Promise<void> => {
    try {
      // First check if we already have permission
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      
      // Only proceed if permission is already granted
      if (status === 'granted') {
        // Use core function to get location data
        await fetchLocationData();
      }
      // If no permission, do nothing - user will be prompted later when needed
    } catch (error) {
      // Silently fail - we'll handle location issues in the relevant screens
      console.log("Background location fetch failed:", error);
    }
  };

  // Context value object
  const contextValue: LocationContextType = {
    location,
    setLocation,
    address,
    isLoading,
    error,
    updateLocation,
    clearError,
    getCurrentLocation,
    fetchLocationWithoutRequestingPermisisons,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

// Custom hook to use the location context
export function useLocation() {
  const context = useContext(LocationContext);
  
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  
  return context;
} 