import { Text, StyleSheet, TextProps, Linking } from "react-native";
import { Href, Link } from "expo-router";
import Colors from "@/constants/Colors";

interface TextLinkProps extends TextProps {
  href?: Href; // For navigation within app
  url?: string;  // For external URLs
  onPress?: () => void; // For custom actions
  children: React.ReactNode;
}

export default function TextLink({ 
  href, 
  url, 
  onPress, 
  children, 
  style, 
  ...props 
}: TextLinkProps) {
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
    <Text 
      style={[styles.link, style]} 
      onPress={onPress || (url ? () => Linking.openURL(url) : undefined)}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    color: Colors.light.primary,
    textDecorationLine: "underline",
  }
});