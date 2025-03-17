import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LogInScreen () {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
});