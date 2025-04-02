import { createContext, useContext, useState, ReactNode } from "react";
import * as ExpoLocation from "expo-location";

// Define the shape of the context data
type LocationContextType = {
  location: ExpoLocation.LocationObject | null;
  address: ExpoLocation.LocationGeocodedAddress | null;
  isLoading: boolean;
  error: string | null;
  updateLocation: (
    newLocation: ExpoLocation.LocationObject, 
    newAddress?: ExpoLocation.LocationGeocodedAddress
  ) => void;
  clearError: () => void;
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

  // Context value object
  const contextValue: LocationContextType = {
    location,
    address,
    isLoading,
    error,
    updateLocation,
    clearError,
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