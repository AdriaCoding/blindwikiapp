import { Text, View, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useState } from "react";

export default function SettingsScreen() {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ca");
  const [selectedUnit, setSelectedUnit] = useState("meters");

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
      <Text style={styles.label}>Idioma:</Text>
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={open}
          value={selectedLanguage}
          items={languages}
          setOpen={setOpen}
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
      <Text style={styles.label}>Unitat de Mesura:</Text>
      <DropDownPicker
        open={open}
        value={selectedUnit}
        items={units}
        setOpen={setOpen}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    borderColor: "#ccc",
    height: 5,
    margin: 16,
  },
  dropdownText: {
    fontSize: 18,
  },
});
