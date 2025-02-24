import { Text, View, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [openLanguage, setOpenLanguage] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [selectedUnit, setSelectedUnit] = useState("meters");

  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage, i18n]);

  const languages = [
    { label: "English", value: "en" },
    { label: "Español", value: "es" },
    { label: "Català", value: "ca" },
  ];

  const units = [
    { label: "Meters", value: "meters" },
    { label: "Miles", value: "miles" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.settingContainer}>
        <Text style={styles.label}>{t('hello')}</Text>
        <DropDownPicker
          open={openLanguage}
          value={selectedLanguage}
          items={languages}
          setOpen={setOpenLanguage}
          setValue={setSelectedLanguage}
          placeholder="Selecciona un idioma"
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          listMode="MODAL" // Makes it more accessible
          modalProps={{
            animationType: "slide",
          }}
          modalTitle="Selecciona el idioma"
        />
      </View>
      <View style={styles.settingContainer}>
        <Text style={styles.label}>Unitat de Mesura:</Text>
        <DropDownPicker
          open={openUnit}
          value={selectedUnit}
          items={units}
          setOpen={setOpenUnit}
          setValue={setSelectedUnit}
          placeholder="Selecciona una unitat"
          style={styles.dropdown}
          textStyle={styles.dropdownText}
          listMode="MODAL"
          modalProps={{
            animationType: "slide",
          }}
          modalTitle="Selecciona la unitat de mesura"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 18,
    marginBottom: 8,
  },
  dropdown: {
    borderColor: "#ccc",
    height: 50,  // Fixed the height to make dropdown visible
  },
  dropdownText: {
    fontSize: 18,
  },
});
