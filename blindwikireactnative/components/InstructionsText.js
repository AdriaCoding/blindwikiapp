import { View, Text, StyleSheet } from "react-native";

function InstructionsText ({text}){
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
export default InstructionsText;

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