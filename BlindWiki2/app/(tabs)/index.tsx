import { StyleSheet, Pressable } from 'react-native';
import { InstructionsText } from '@/components/StyledText';
import Location from '@/components/Location';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';
import { Text, View } from 'react-native';
import StyledButton from '@/components/StyledButton';
import { router } from 'expo-router';

function record() {
  console.log('Recording...');
  router.push('/edit');
}


export default function HomeScreen() {
  const { t } = useTranslation();
  return (
    <View style={styles.homeContainer}>
      <InstructionsText>{t('home.info-gps')}</InstructionsText>
      <Location />
      <InstructionsText>{t('home.info-record')}</InstructionsText>
      <StyledButton onPress={record}
        title={t('home.record')}
        style={styles.recordButton}
        textStyle={styles.recordButtonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    alignItems: "center",
    margin: 10
  },
  recordButton: {
    flex: 2,
    width: "95%",
  },
  recordButtonText: {
    fontSize: 20,
  },
});
