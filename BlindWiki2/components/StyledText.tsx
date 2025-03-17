import { Text, TextProps, StyleSheet, View} from 'react-native';

export function MonoText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}
export function InstructionsText (props: TextProps) {
  return (
    <View style={styles.container}>
      <Text {...props} style={styles.text}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 25,
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
});