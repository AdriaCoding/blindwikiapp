import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
  Modal,
  Alert
} from 'react-native';

function SettingsScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [selectedUnit, setSelectedUnit] = useState('meters');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

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

  // iOS: Show ActionSheetIOS
  // Android: Show custom Modal
  const showLanguageOptions = () => {
    if (Platform.OS === 'ios') {
      const options = languages.map(lang => lang.label);
      options.push('Cancelar');
      const cancelButtonIndex = options.length - 1;
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
      setShowLanguageModal(true);
    }
  };

  const showUnitOptions = () => {
    if (Platform.OS === 'ios') {
      const options = units.map(u => u.label);
      options.push('Cancelar');
      const cancelButtonIndex = options.length - 1;
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
      setShowUnitModal(true);
    }
  };

  // Render modal lists for Android
  const renderModalContent = (dataList, onSelect, onClose) => (
    <View style={styles.modalContainer}>
      {dataList.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.modalItem}
          onPress={() => {
            onSelect(item.value);
            onClose();
          }}
        >
          <Text>{item.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={onClose}>
        <Text style={{ color: 'blue', marginTop: 10 }}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );

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

      {/* Android Modal for language options */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.overlay}>
          {renderModalContent(
            languages,
            value => setSelectedLanguage(value),
            () => setShowLanguageModal(false)
          )}
        </View>
      </Modal>

      {/* Android Modal for unit options */}
      <Modal
        visible={showUnitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnitModal(false)}
      >
        <View style={styles.overlay}>
          {renderModalContent(
            units,
            value => setSelectedUnit(value),
            () => setShowUnitModal(false)
          )}
        </View>
      </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '70%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  modalItem: {
    paddingVertical: 12,
  },
});