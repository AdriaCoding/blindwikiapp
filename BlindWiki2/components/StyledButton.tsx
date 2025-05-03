import {
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { useState } from "react";
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
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  if (isRecording) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.recordingContainer, style]}>
        <RecordingAnimation onPress={onPress} audioLevel={audioLevel} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        isPressed ? styles.buttonPressed : styles.buttonRaised,
        style,
      ]}
      activeOpacity={0.8}
    >
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
    paddingVertical: 12,
    marginVertical: 2,
    borderRadius: 4,
  },
  buttonRaised: {
    shadowColor: Colors.light.button.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.light.button.borderLight,
    borderBottomWidth: 3,
    borderBottomColor: Colors.light.button.borderDark,
  },
  buttonPressed: {
    shadowColor: Colors.light.button.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.button.borderDark,
    transform: [{ translateY: 2 }],
    backgroundColor: Colors.light.button.background,
  },
  recordingContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: Colors.light.button.background,
    borderRadius: 8,
    shadowColor: Colors.light.button.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  text: {
    color: Colors.light.button.text,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
