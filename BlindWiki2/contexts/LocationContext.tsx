import { createContext, useContext, useState, ReactNode } from "react";
import * as ExpoLocation from "expo-location";
import { Alert, Linking, Platform } from "react-native";

// Define result types for better type checking
type LocationSuccessResult = {
  success: true;
  position: ExpoLocation.LocationObject;
  address?: ExpoLocation.LocationGeocodedAddress;
  // locationText is removed from here, will be in context state
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
  locationText: string | null; // Add locationText state
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
  const [locationText, setLocationText] = useState<string | null>(null); // Add state for locationText
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
    } else {
      setAddress(null); // Clear address if not provided
    }
    setLocationText(null); // Clear locationText when core location changes
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

        let generatedLocationText: string | null = null;
        if (addressResponse && addressResponse.length > 0) {
          const addressData = addressResponse[0];
          // Update the location context
          setLocation(position); // Update position
          setAddress(addressData); // Update address
          
          // Generate and set locationText state
          const parts = [
            addressData.street,
            addressData.district,
            `${addressData.postalCode || ''} ${addressData.city || ''}`.trim(),
            addressData.country,
          ];
          generatedLocationText = parts.filter(Boolean).join(', ').trim();

          setLocationText(generatedLocationText || null); // Set the state

          return { 
            success: true, 
            position, 
            address: addressData
          };
        } else {
          // Update the location context with position only
          setLocation(position); // Update position
          setAddress(null); // Clear address
          
          // Generate and set locationText state using coordinates
          generatedLocationText = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
          setLocationText(generatedLocationText); // Set state with coordinates

          return { success: true, position };
        }
      } catch (err) {
        console.warn("Reverse geocoding failed:", err); // Changed to warn as it's not critical
        // If geocoding fails, at least update with position
        setLocation(position); // Update position
        setAddress(null); // Clear address

        // Generate and set locationText state using coordinates
        const generatedLocationText = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setLocationText(generatedLocationText); // Set state with coordinates
        
        return { success: true, position };
      }
    } catch (err) {
      console.error("Error getting location data:", err);
      // Assign error message first, then return, to potentially help linter
      const errorMsg = t ? t("location.error") : "Error getting location";
      return { error: errorMsg };
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
    locationText, // Add locationText here
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