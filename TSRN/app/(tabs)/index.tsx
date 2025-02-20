import { StyleSheet, Pressable} from 'react-native';

import InstructionsText from '@/components/InstructionsText';
import Location from '@/components/Location';
import { Text, View } from '@/components/Themed';

function record() {
  console.log('Recording...');
}
const ubicació = () => {
  return "Carrer de Sant Antoni Maria Claret, 171, Horta-Guinardó, 08041 Barcelona, España : Alta Precisió del GPS";
}

export default function HomeScreen() {
  return (
    <View>
      <InstructionsText text="Prem el següent botó per actualitzar la teva ubicació GPS"/>
      <Location location={ubicació()} />
      <InstructionsText text="Prem el següent botó 'Gravar' per iniciar la gravació de so. Prem-lo novament per acabar la gravació"/>
      <Pressable style={styles.buttonContainer} onPress={record}>
        <Text style={styles.buttonText}>Gravar</Text>  
      </Pressable>
    </View>
  );
}

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
    padding: 25,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  }
});
