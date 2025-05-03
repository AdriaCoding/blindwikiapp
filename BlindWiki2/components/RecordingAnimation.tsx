import React, { useEffect } from 'react';
import { StyleSheet, View, GestureResponderEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';

interface RecordingAnimationProps {
  onPress: (event: GestureResponderEvent) => void;
  audioLevel: number;
}

export default function RecordingAnimation({ onPress, audioLevel }: RecordingAnimationProps) {
  // Animation values for different aspects of the animation
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const borderWidth = useSharedValue(2);
  const rotation = useSharedValue(0);

  // React to audio level changes
  useEffect(() => {
    // Scale animation based on audio level
    scale.value = withSpring(1.5 + audioLevel * 1, {
      damping: 4,
      stiffness: 120,
    });
    
    // Border width animation based on audio level
    borderWidth.value = withSpring(2 + audioLevel * 5, {
      damping: 3,
      stiffness: 90,
    });
    
    // Opacity based on audio level
    opacity.value = withTiming(0.8 + audioLevel * 0.2, {
      duration: 100,
    });
    
    // Continuous rotation regardless of audio level
    rotation.value = withTiming(rotation.value + 5, {
      duration: 100,
    });
  }, [audioLevel]);

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

  // Compute colors based on audio level for more visual feedback
  const outerRingStyle = useAnimatedStyle(() => {
    return {
      borderColor: `rgba(0, 0, 0, ${0.7 - audioLevel * 0.5})`,
    };
  });
  const innerRingStyle = useAnimatedStyle(() => {
    return {
      borderColor: `rgba(0, 0, 0, ${0.8 - audioLevel * 0.4})`,
    };
  });

  const centerCircleStyle = useAnimatedStyle(() => {
    return {
      borderColor: `rgba(0, 0, 0, ${0.9 - audioLevel * 0.3})`,
    };
  });


  return (
    <View style={styles.container}>
      <Animated.View style={[styles.outerRing, animatedStyle, outerRingStyle]} />
      <Animated.View style={[styles.innerRing, animatedStyle, innerRingStyle]} />
      <Animated.View style={[styles.centerCircle, animatedStyle, centerCircleStyle]} />
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
    backgroundColor: Colors.light.button.background,
  },
}); 