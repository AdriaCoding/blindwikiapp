import { Text, TextProps, StyleSheet, View} from 'react-native';
import { useSettings } from '@/contexts/SettingsContext';
import Colors from '@/constants/Colors';
export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}
export function InstructionsText (props: TextProps) {
  const { showInstructions } = useSettings();
  if (!showInstructions) {
    return null;
  }
  return (
    <View style={styles.container}>
      <Text {...props} style={styles.text}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    width: '100%',
  },
  text: {
    fontSize: 20,
    color: Colors.light.text,
  },
});