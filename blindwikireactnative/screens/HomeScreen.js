import { View, Text, StyleSheet, Button} from "react-native";
import InstructionsText from "../components/InstructionsText";
import Location from "../components/Location";
function HomeScreen() {
  return (
    <View>
      <InstructionsText text="Prem el següent botó per actualitzar la teva ubicació GPS"/>
      <Location text="Actualitzar ubicació"/>
      <InstructionsText text="Prem el següent botó 'Gravar' per iniciar la gravació de so. Prem-lo novament per acabar la gravació"/>
      <View>
        <Button title="Gravar"/>
      </View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({

});