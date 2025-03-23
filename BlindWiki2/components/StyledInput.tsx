import {
  TextInput,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import Colors from "@/constants/Colors";
// A special black button with full width, optional height, and a press handler
interface StyledInputProps {
  value: string;
  onchangeText: (text: string) => void;
  placeholder?: string;
  secure?: boolean;
}

export default function StyledInput({
  value,
  onchangeText,
  placeholder,
  secure,
}: StyledInputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={Colors.light.placeHolderText}
      secureTextEntry={secure}
      value={value}
      onChangeText={onchangeText}
      autoCapitalize="none"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: Colors.light.formBackground,
  },
});
