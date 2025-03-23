import { Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from "react-native";
import Colors from "@/constants/Colors";
// A special black button with full width, optional height, and a press handler
interface StyledButton {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  height?: number;
}

export default function StyledButton({ title, onPress, height }: StyledButton) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, height ? { height } : null]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.button.background ,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 2,
    borderRadius: 4,
  },
  text: {
    color: Colors.light.button.text,
    textAlign: "center",
    fontSize: 16,
  },
});