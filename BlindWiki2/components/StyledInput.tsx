import {
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import Colors from "@/constants/Colors";
// A special black button with full width, optional height, and a press handler


export default function StyledInput({ 
  style, 
  ...props 
}: TextInputProps) {
  return (
    <TextInput
      autoCapitalize="none"
      placeholderTextColor={Colors.light.placeHolderText}
      style={[
        styles.input, 
        { height: 50 * (props.numberOfLines? props.numberOfLines : 1) },
        style // Permite sobrescribir estilos desde fuera
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: Colors.light.formBackground,
    textAlignVertical: 'top',
  },
});
