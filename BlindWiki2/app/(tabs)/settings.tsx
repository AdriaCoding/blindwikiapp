import { Text, View, StyleSheet, Pressable } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import {
  useSettings,
  MeasureUnit,
  createUnitItems,
} from "@/contexts/SettingsContext";
import { createLanguageItems } from "@/locales/i18n";
import BWButton from "@/components/BWButton";
import { InstructionsText } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { SettingPicker } from "@/components/SettingPicker";
import { router } from "expo-router";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  // Get global state from context
  const {
    unit: globalUnit,
    setUnit: setGlobalUnit,
    showInstructions: globalShowInstructions,
    setShowInstructions: setGlobalShowInstructions,
  } = useSettings();

  const [openLanguage, setOpenLanguage] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [selectedUnit, setSelectedUnit] = useState<MeasureUnit>(globalUnit);
  const [selectedShowInstructions, setSelectedShowInstructions] = useState(
    globalShowInstructions
  );

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
        <SettingPicker
          label={t("settings.language.title")}
          value={selectedLanguage}
          items={languages}
          setValue={setSelectedLanguage}
          placeholder={t("settings.language.modalTitle")}
          modalTitle={t("settings.language.modalTitle")}
        />
      </View>
      <View style={styles.settingContainer}>
        <SettingPicker
          label={t("settings.measureUnit.title")}
          value={selectedUnit}
          items={units}
          setValue={setSelectedUnit}
          placeholder={t("settings.measureUnit.modalTitle")}
          modalTitle={t("settings.measureUnit.modalTitle")}
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
              color={
                selectedShowInstructions
                  ? Colors.light.primary
                  : Colors.light.tabBar.inactive
              }
              style={styles.checkboxIcon}
            />
            <Text style={styles.checkboxLabel}>
              {t("settings.showInstructions")}
            </Text>
          </View>
        </Pressable>
      </View>
      <View style={styles.settingContainer}>
        <BWButton title="Log In" onPress={() => router.push('/logInScreen')} />
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
    paddingVertical: 8, // Adds internal padding
  },
  checkboxContainer: {
    alignItems: "center", // Centers items horizontally
    paddingVertical: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center", // Centers items vertically
  },
  checkboxIcon: {
    marginRight: 8, // Adds space between icon and text
  },
  checkboxLabel: {
    fontSize: 18,
  },
});
