import { StyleSheet, Pressable } from 'react-native';
import { InstructionsText } from '@/components/StyledText';
import Location from '@/components/Location';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { Text, View } from 'react-native';
import StyledButton from '@/components/StyledButton';
function record() {
  console.log('Recording...');
}
const ubicació = () => {
  return "Carrer de Sant Antoni Maria Claret, 171, Horta-Guinardó, 08041 Barcelona, España : Alta Precisió del GPS";
}

export default function HomeScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.homeContainer}>
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
  homeContainer: {
    flex: 1,
    alignItems: "center",
    margin: 10
  },
  buttonContainer: {
    alignSelf: "center",
    flex: 2,
    width: "95%",
    backgroundColor: Colors.light.button.background,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    padding: 25,
    marginVertical: 10,
  },
  buttonText: {
    color: Colors.light.button.text,
    fontSize: 20,
  }
});
