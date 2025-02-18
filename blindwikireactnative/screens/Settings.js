import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActionSheetProvider, connectActionSheet, useActionSheet } from '@expo/react-native-action-sheet';

function SettingsScreen() {
  const { showActionSheetWithOptions } = useActionSheet();

  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [selectedUnit, setSelectedUnit] = useState('meters');

  const languages = [
    { label: 'Español', value: 'es' },
    { label: 'Inglés', value: 'en' },
    { label: 'Francés', value: 'fr' },
    { label: 'Alemán', value: 'de' },
  ];

  const units = [
    { label: 'Metros', value: 'meters' },
    { label: 'Millas', value: 'miles' },
  ];

  const showLanguageOptions = () => {
    const options = [...languages.map(lang => lang.label), 'Cancelar'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
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
  };

  const showUnitOptions = () => {
    const options = [...units.map(u => u.label), 'Cancelar'];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
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
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecciona el idioma:</Text>
      <TouchableOpacity style={styles.dropdown} onPress={showLanguageOptions}>
        <Text style={styles.dropdownText}>
          {languages.find(l => l.value === selectedLanguage)?.label}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Selecciona la unidad de medida:</Text>
      <TouchableOpacity style={styles.dropdown} onPress={showUnitOptions}>
        <Text style={styles.dropdownText}>
          {units.find(u => u.value === selectedUnit)?.label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Wrap your screen with the ActionSheetProvider
const WrappedSettingsScreen = props => (
  <ActionSheetProvider>
    <SettingsScreen {...props} />
  </ActionSheetProvider>
);

// Connect to the action sheet
export default connectActionSheet(WrappedSettingsScreen);

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