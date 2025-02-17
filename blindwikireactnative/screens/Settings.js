import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActionSheetIOS, Platform } from "react-native";
import ActionSheet from 'react-native-actionsheet';

function SettingsScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState("es");
  const [selectedUnit, setSelectedUnit] = useState("meters");

  const languageActionSheet = useRef(null);
  const unitActionSheet = useRef(null);

  const languages = [
    { label: "Español", value: "es" },
    { label: "Inglés", value: "en" },
    { label: "Francés", value: "fr" },
    { label: "Alemán", value: "de" },
  ];

  const units = [
    { label: "Metros", value: "meters" },
    { label: "Millas", value: "miles" },
  ];

  const showLanguageOptions = () => {
    if (Platform.OS === 'ios') {
      const options = languages.map(lang => lang.label);
      const cancelButtonIndex = options.length;
      options.push('Cancelar');

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        buttonIndex => {
          if (buttonIndex !== cancelButtonIndex) {
            setSelectedLanguage(languages[buttonIndex].value);
          }
        }
      );
    } else {
      languageActionSheet.current.show();
    }
  };

  const showUnitOptions = () => {
    if (Platform.OS === 'ios') {
      const options = units.map(unit => unit.label);
      const cancelButtonIndex = options.length;
      options.push('Cancelar');

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        buttonIndex => {
          if (buttonIndex !== cancelButtonIndex) {
            setSelectedUnit(units[buttonIndex].value);
          }
        }
      );
    } else {
      unitActionSheet.current.show();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecciona el idioma:</Text>
      <TouchableOpacity style={styles.dropdown} onPress={showLanguageOptions}>
        <Text style={styles.dropdownText}>{languages.find(lang => lang.value === selectedLanguage).label}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Selecciona la unidad de medida:</Text>
      <TouchableOpacity style={styles.dropdown} onPress={showUnitOptions}>
        <Text style={styles.dropdownText}>{units.find(unit => unit.value === selectedUnit).label}</Text>
      </TouchableOpacity>

      <ActionSheet
        ref={languageActionSheet}
        title={'Selecciona el idioma'}
        options={[...languages.map(lang => lang.label), 'Cancelar']}
        cancelButtonIndex={languages.length}
        onPress={(index) => {
          if (index !== languages.length) {
            setSelectedLanguage(languages[index].value);
          }
        }}
      />

      <ActionSheet
        ref={unitActionSheet}
        title={'Selecciona la unidad de medida'}
        options={[...units.map(unit => unit.label), 'Cancelar']}
        cancelButtonIndex={units.length}
        onPress={(index) => {
          if (index !== units.length) {
            setSelectedUnit(units[index].value);
          }
        }}
      />
    </View>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  dropdown: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  dropdownText: {
    fontSize: 16,
  },
});