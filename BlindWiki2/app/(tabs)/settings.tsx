import { Text, View, StyleSheet, Pressable } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const [openLanguage, setOpenLanguage] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [language, setSelectedLanguage] = useState(i18n.language);
  const [unit, setSelectedUnit] = useState("meters");
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  const languages = [
    { label: t('settings.language.en'), value: "en" },
    { label: t('settings.language.es'), value: "es" },
    { label: t('settings.language.ca'), value: "ca" },
  ];

  const units = [
    { label: t('settings.measureUnit.meters'), value: "meters" },
    { label: t('settings.measureUnit.miles'), value: "miles" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.settingContainer}>
        <Text style={styles.label}>{t('settings.language.title')}</Text>
        <DropDownPicker
          open={openLanguage}
          value={language}
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
        <Text style={styles.label}>{t('settings.measureUnit.title')}</Text>
        <DropDownPicker
          open={openUnit}
          value={unit}
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
          onPress={() => setShowInstructions(!showInstructions)}
          accessible={true}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: showInstructions }}
          style={styles.checkboxContainer}
        >
          <View style={styles.checkboxRow}>
            <FontAwesome
              name={showInstructions ? "check-square-o" : "square-o"}
              size={24}
              color={showInstructions ? "blue" : "gray"}
              style={styles.checkboxIcon}
            />
            <Text style={styles.checkboxLabel}>{t('settings.showInstructions')}</Text>
          </View>
        </Pressable>
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
