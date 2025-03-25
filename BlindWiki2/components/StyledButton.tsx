import {
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import Colors from "@/constants/Colors";
// A special black button with full width, optional height, and a press handler
interface StyledButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function StyledButton({
  title,
  onPress,
  style,
  textStyle,
}: StyledButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.light.button.background,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
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
