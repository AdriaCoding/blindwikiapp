import { Text, View, StyleSheet, Pressable } from "react-native";
import { useState, useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import {
  useSettings,
  MeasureUnit,
  createUnitItems,
} from "@/contexts/SettingsContext";
import { createLanguageItems } from "@/locales/i18n";
import StyledButton from "@/components/StyledButton";
import Colors from "@/constants/Colors";
import { SettingPicker } from "@/components/SettingPicker";
import { router } from "expo-router";
import { Alert } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const languages = createLanguageItems(t);
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage, i18n]);

  const { unit, setUnit, showInstructions, setShowInstructions } =
    useSettings();
  const units = createUnitItems(t);

  const { user, logout, isLoggedIn, isLoading } = useAuth();
  const handleLogout = async () => {
    const response = await logout();

    if (response.success) {
      Alert.alert(t("settings.logout.alert.success"));
    } else {
      Alert.alert(
        t("settings.logout.alert.error.title"),
        response.errorMessage || t("settings.logout.alert.error.message")
      );
    }
  };

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
          value={unit}
          items={units}
          setValue={setUnit}
          placeholder={t("settings.measureUnit.modalTitle")}
          modalTitle={t("settings.measureUnit.modalTitle")}
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
              color={
                showInstructions
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
        {!isLoggedIn() ? (
          <StyledButton
            title={t("login.title")}
            onPress={() => router.push("/login")}
          />
        ) : (
          <StyledButton title={t("settings.logout.title")} onPress={handleLogout} />
        )}
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
  welcomeText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
});
