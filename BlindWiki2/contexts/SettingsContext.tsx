import { createContext, useState, useContext, ReactNode, useCallback } from 'react';

export type MeasureUnit = "meters" | "miles";

export const createUnitItems = (t: (key: string) => string): Array<{label: string, value: MeasureUnit}> => [
    { label: t('settings.measureUnit.meters'), value: "meters" },
    { label: t('settings.measureUnit.miles'), value: "miles" },
  ];

type SettingsContextType = {
  unit: MeasureUnit;
  setUnit: (unit: MeasureUnit | ((prev: MeasureUnit) => MeasureUnit)) => void;
  showInstructions: boolean;
  setShowInstructions: (show: boolean | ((prev: boolean) => boolean)) => void;
  language?: string;
  setLanguage?: (language: string | ((prev: string) => string)) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<MeasureUnit>("meters");
  const [showInstructions, setShowInstructionsState] = useState(true);

  // Custom setters that handle both value and callback updates
  const setUnit = useCallback((value: MeasureUnit | ((prev: MeasureUnit) => MeasureUnit)) => {
    if (typeof value === 'function') {
      setUnitState(prev => (value as Function)(prev));
    } else {
      setUnitState(value);
    }
  }, []);

  const setShowInstructions = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    if (typeof value === 'function') {
      setShowInstructionsState(prev => (value as Function)(prev));
    } else {
      setShowInstructionsState(value);
    }
  }, []);


  return (
    <SettingsContext.Provider 
      value={{
        unit,
        setUnit,
        showInstructions,
        setShowInstructions,
              }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}