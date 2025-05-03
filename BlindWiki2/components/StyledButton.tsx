import {
  Text,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Pressable,
} from "react-native";
import { useState, useRef, useEffect } from "react";
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    setIsPressed(true);
    animateIn();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    animateOut();
  };

  if (isRecording) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.recordingContainer, style]}>
        <RecordingAnimation onPress={onPress} audioLevel={audioLevel} />
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.button,
          isPressed ? styles.buttonPressed : styles.buttonRaised,
        ]}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    width: "100%",
    flex: 1,
  },
  button: {
    backgroundColor: Colors.light.button.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 2,
    borderRadius: 4,
    height: "100%",
  },
  buttonRaised: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  buttonPressed: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    borderBottomWidth: 1,
    transform: [{ translateY: 2 }],
  },
  recordingContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: Colors.light.button.background,
    borderRadius: 8,
    shadowColor: "#000",
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
