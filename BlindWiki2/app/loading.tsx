import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  Image,
  Dimensions,
} from "react-native";
import Colors from "../constants/Colors";
import { useTranslation } from "react-i18next";

// Add the prop type
type LoadingScreenProps = {
  loading?: boolean;
};

export default function LoadingScreen({ loading = false }: LoadingScreenProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{t("loading.title")}</Text>
        <Image
          source={require("../assets/images/icon.png")}
          style={styles.BWlogo}
          resizeMode="contain"
        />
      </View>
      {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
            style={{ marginVertical: 20 }}
          />
        )}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>{t("loading.subtitle")}</Text>
        <Text style={styles.credits}>{t("loading.credits")}</Text>

        <Image
          source={require("../assets/images/ideai_upc.jpg")}
          style={styles.UPCbanner}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  loadingContainer: {
    width: width,
    height: height,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.light.background,
  },
  titleContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  subtitleContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  UPCbanner: {
    width: width - 20,
  },
  BWlogo: {
    width: width * 0.65,
    height: width * 0.65,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 10,
  },
  credits: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: "center",
    opacity: 0.8,
  },
});
