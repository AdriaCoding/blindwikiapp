import { View, Text, StyleSheet } from "react-native";
import React from "react";
import DropDownPicker from "react-native-dropdown-picker";
import Colors from "@/constants/Colors";
import { useState, useEffect } from "react";

interface SettingPickerProps {
  label: string;
  value: string | number;
  items: Array<{ label: string; value: string | number }>;
  setValue: (callback: (val: any) => any) => void;
  placeholder: string;
  modalTitle: string;
}

export function SettingPicker({ 
  label,
  value,
  items,
  setValue,
  placeholder,
  modalTitle
}: SettingPickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.settingContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        placeholder={placeholder}
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        listMode="MODAL"
        modalProps={{
          animationType: "slide",
        }}
        modalTitle={modalTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  settingContainer: {
    flex: 1,
    marginBottom: 24,
    paddingVertical: 8,
  },
  label: {
    fontSize: 20,
    marginBottom: 8,
  },
  dropdown: {
    borderColor: Colors.light.border,
    height: 50,
  },
  dropdownText: {
    fontSize: 24,
  }
});