import { StyleSheet, Pressable } from 'react-native';
import { InstructionsText } from '@/components/StyledText';
import Location from '@/components/Location';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
function record() {
  console.log('Recording...');
}
const ubicació = () => {
  return "Carrer de Sant Antoni Maria Claret, 171, Horta-Guinardó, 08041 Barcelona, España : Alta Precisió del GPS";
}

export default function HomeScreen() {
  const { t } = useTranslation();
  return (
    <View>
      <InstructionsText>{t('home.info-gps')}</InstructionsText>
      <Location location={ubicació()} />
      <InstructionsText>{t('home.info-record')}</InstructionsText>
      <Pressable style={styles.buttonContainer} onPress={record}>
        <Text style={styles.buttonText}>{t('home.record')}</Text>
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
