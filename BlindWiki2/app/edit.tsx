import { StyleSheet, View, TextInput } from "react-native";
import StyledInput from "@/components/StyledInput";

export default function EditScreen() {
  return <View style={styles.container}>    
    <StyledInput/>
  </View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    margin: 10
  },
});
