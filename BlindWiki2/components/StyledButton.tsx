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
import RecordingAnimation from "./RecordingAnimation";
// A special black button with full width, optional height, and a press handler
interface StyledButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isRecording?: boolean;
  audioLevel?: number;
}

export default function StyledButton({
  title,
  onPress,
  style,
  textStyle,
  isRecording = false,
  audioLevel = 0,
}: StyledButtonProps) {
  if (isRecording) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.recordingContainer, style]}>
        <RecordingAnimation onPress={onPress} audioLevel={audioLevel} />
      </TouchableOpacity>
    );
  }

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
  recordingContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: Colors.light.button.background,
  },
  text: {
    color: Colors.light.button.text,
    textAlign: "center",
    fontSize: 16,
  },
});
