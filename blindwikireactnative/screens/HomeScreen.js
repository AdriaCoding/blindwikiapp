import { View, Text, StyleSheet, Button, Pressable} from "react-native";
import InstructionsText from "../components/InstructionsText";
import Location from "../components/Location";

function record() {
  console.log('Recording...');
}
function HomeScreen() {
  return (
    <View>
      <InstructionsText text="Prem el següent botó per actualitzar la teva ubicació GPS"/>
      <Location text="Actualitzar ubicació"/>
      <InstructionsText text="Prem el següent botó 'Gravar' per iniciar la gravació de so. Prem-lo novament per acabar la gravació"/>
      <Pressable style={styles.buttonContainer} onPress={record}>
        <Text style={styles.buttonText}>Gravar</Text>  
      </Pressable>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  buttonContainer: {
    margin: 15,
    alignSelf: "center",
    width: "95%",
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 2,
    margin: 10,
    padding: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  }
});