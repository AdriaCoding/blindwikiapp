import { Text, StyleSheet, TextProps, Linking } from "react-native";
import { Href, Link } from "expo-router";
import Colors from "@/constants/Colors";

type TextLinkProps = Omit<TextProps, 'onPress'> & {
  href?: Href; // For navigation within app
  url?: string;  // For external URLs
  onPress?: () => void; // For custom actions
  children: React.ReactNode;
  style?: TextProps['style'];
};

export default function TextLink({ href, url, onPress, children, style, ...props }: TextLinkProps) {
  const handlePress = async () => {
    if (url) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } else if (onPress) {
      onPress();
    }
  };

  if (href) {
    return (
      <Link href={href} asChild>
        <Text style={[styles.link, style]} {...props}>
          {children}
        </Text>
      </Link>
    );
  }

  return (
    <Text style={[styles.link, style]} onPress={handlePress} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
});