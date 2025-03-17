import { View, Text, StyleSheet, Pressable } from "react-native";

function pressLocationHandler() {
  console.log("Location pressed : BEEP");
}

export default function Location({location}: {location: any}) {
  return (
      <Pressable style={styles.outerBox} onPress={pressLocationHandler} accessibilityLabel={"La teva ubicació eś:" + location}>
        <Text style={styles.text}>{location}</Text>
      </Pressable>
  );
}


const styles = StyleSheet.create({
  outerBox: {
    alignSelf: "center",
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    padding: 25,
  },
  text: {
    textAlign: "center",
    fontSize: 17,
  },
});
