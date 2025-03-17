import { createContext, useState, useContext, ReactNode } from 'react';

export type MeasureUnit = "meters" | "miles";

export const createUnitItems = (t: (key: string) => string): Array<{label: string, value: MeasureUnit}> => [
    { label: t('settings.measureUnit.meters'), value: "meters" },
    { label: t('settings.measureUnit.miles'), value: "miles" },
  ];

type SettingsContextType = {
  unit: MeasureUnit;
  setUnit: (unit: MeasureUnit) => void;
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<MeasureUnit>("meters");
  const [showInstructions, setShowInstructions] = useState(true);

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