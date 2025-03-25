import {
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import Colors from "@/constants/Colors";
// A special black button with full width, optional height, and a press handler
interface StyledInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secure?: boolean;
}

export default function StyledInput(props: TextInputProps) {
  return (
    <TextInput
    autoCapitalize="none"
    placeholderTextColor={Colors.light.placeHolderText}
    style={styles.input}
      {...props}
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
