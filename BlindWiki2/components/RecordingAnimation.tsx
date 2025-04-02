import React, { useEffect } from 'react';
import { StyleSheet, View, GestureResponderEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface RecordingAnimationProps {
  onPress: (event: GestureResponderEvent) => void;
}

export default function RecordingAnimation({ onPress }: RecordingAnimationProps) {
  // Animation values for different aspects of the animation
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const borderWidth = useSharedValue(2);
  const rotation = useSharedValue(0);

  // Simulate voice input reaction (you can replace this with actual voice level detection)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly generate a voice level between 0 and 1
      const voiceLevel = Math.random();
      
      // React to voice level with different animations
      scale.value = withSpring(1 + voiceLevel * 0.2, {
        damping: 8,
        stiffness: 100,
      });
      
      borderWidth.value = withSpring(2 + voiceLevel * 4, {
        damping: 8,
        stiffness: 100,
      });
      
      opacity.value = withTiming(0.5 + voiceLevel * 0.5, {
        duration: 200,
      });
      
      rotation.value = withTiming(rotation.value + 5, {
        duration: 100,
      });
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, []);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
      borderWidth: borderWidth.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.outerRing, animatedStyle]} />
      <Animated.View style={[styles.innerRing, animatedStyle]} />
      <Animated.View style={[styles.centerCircle, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: Colors.light.button.text,
    borderWidth: 2,
  },
  innerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: Colors.light.button.text,
    borderWidth: 2,
  },
  centerCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.button.text,
  },
}); 