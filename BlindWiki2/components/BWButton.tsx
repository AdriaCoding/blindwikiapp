import { Text, StyleSheet, TouchableOpacity, GestureResponderEvent } from "react-native";
import Colors from "@/constants/Colors";
// A special black button with full width, optional height, and a press handler
interface BWButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  height?: number;
}

export default function BWButton({ title, onPress, height }: BWButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.bwButton, height ? { height } : null]}
    >
      <Text style={styles.bwButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bwButton: {
    backgroundColor: Colors.light.BWButton.background ,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 2,
    borderRadius: 4,
  },
  bwButtonText: {
    color: Colors.light.BWButton.text,
    textAlign: "center",
    fontSize: 16,
  },
});