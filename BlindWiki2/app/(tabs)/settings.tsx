import { Text, View, StyleSheet, Pressable } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { useSettings, MeasureUnit, createUnitItems } from "@/contexts/SettingsContext";
import { createLanguageItems } from "@/locales/i18n";
import BWButton from "@/components/BWButton";
import { InstructionsText } from "@/components/StyledText";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  // Get global state from context
  const { 
    unit: globalUnit, 
    setUnit: setGlobalUnit,
    showInstructions: globalShowInstructions,
    setShowInstructions: setGlobalShowInstructions
  } = useSettings();

  const [openLanguage, setOpenLanguage] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [selectedUnit, setSelectedUnit] = useState<MeasureUnit>(globalUnit);
  const [selectedShowInstructions, setSelectedShowInstructions] = useState(globalShowInstructions);

  
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage, i18n]);

  useEffect(() => {
    setGlobalUnit(selectedUnit);
  }, [selectedUnit, setGlobalUnit]);

  useEffect(() => {
    setGlobalShowInstructions(selectedShowInstructions);
  }, [selectedShowInstructions, setGlobalShowInstructions]);

  const languages = createLanguageItems(t);

  const units = createUnitItems(t);

  return (
    <View style={styles.container}>
      <View style={styles.settingContainer}>
        <Text style={styles.label}>{t('settings.language.title')}</Text>
        <DropDownPicker
          open={openLanguage}
          value={selectedLanguage}
          items={languages}
          setOpen={setOpenLanguage}
          setValue={setSelectedLanguage}
          placeholder={t('settings.language.modalTitle')}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          listMode="MODAL" // Makes it more accessible
          modalProps={{
            animationType: "slide",
          }}
          modalTitle={t('settings.language.modalTitle')}
        />
      </View>
      <View style={styles.settingContainer}>
        <InstructionsText style={styles.label}>{t('settings.measureUnit.title')}</InstructionsText>
        <DropDownPicker
          open={openUnit}
          value={selectedUnit}
          items={units}
          setOpen={setOpenUnit}
          setValue={setSelectedUnit}
          placeholder={t('settings.measureUnit.modalTitle')}
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          listMode="MODAL"
          modalProps={{
            animationType: "slide",
          }}
          modalTitle={t('settings.measureUnit.modalTitle')}
        />
      </View>
      <View style={styles.settingContainer}>
        <Pressable
          onPress={() => setSelectedShowInstructions(!selectedShowInstructions)}
          accessible={true}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selectedShowInstructions }}
          style={styles.checkboxContainer}
        >
          <View style={styles.checkboxRow}>
            <FontAwesome
              name={selectedShowInstructions ? "check-square-o" : "square-o"}
              size={24}
              color={selectedShowInstructions ? "blue" : "gray"}
              style={styles.checkboxIcon}
            />
            <Text style={styles.checkboxLabel}>{t('settings.showInstructions')}</Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.settingContainer}>
          <BWButton title="Log In" onPress={()=>null}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    height: "50%",
    justifyContent: "center",
    padding: 16,
  },
  settingContainer: {
    flex: 1,
    marginBottom: 24, // Adds space between settings
    paddingVertical: 8,  // Adds internal padding
  },
  label: {
    fontSize: 20,
    marginBottom: 8,
  },
  dropdown: {
    borderColor: "#ccc",
    height: 50,  // Fixed the height to make dropdown visible
  },
  dropdownText: {
    fontSize: 24,
  },
  checkboxContainer: {
    alignItems: 'center', // Centers items horizontally
    paddingVertical: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center', // Centers items vertically
  },
  checkboxIcon: {
    marginRight: 8, // Adds space between icon and text
  },
  checkboxLabel: {
    fontSize: 18,
  }

});
