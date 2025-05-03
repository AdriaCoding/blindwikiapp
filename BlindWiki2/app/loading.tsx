import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import Colors from "../constants/Colors";

export default function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.title}>Blind Wiki 2.0</Text>
      <ActivityIndicator 
        size="large" 
        color={Colors.light.activityIndicator} 
        style={styles.indicator}
      />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.light.primary,
  },
  indicator: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.light.text,
    marginTop: 10,
  }
});
