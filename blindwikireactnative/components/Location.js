import { View, Text, StyleSheet, Pressable } from "react-native";

function pressLocationHandler() {
  console.log("Location pressed : BEEP");
}

function Location({location}) {
  return (
      <Pressable style={styles.outerBox} onPress={pressLocationHandler} accessibilityLabel={"La teva ubicació eś:" + location}>
        <Text style={styles.text}>{location}</Text>
      </Pressable>
  );
}
export default Location;

const styles = StyleSheet.create({
  outerBox: {
    margin: 15,
    alignSelf: "center",
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    margin: 10,
    padding: 25,
  },
  text: {
    textAlign: "center",
    fontSize: 17,
  },
});
