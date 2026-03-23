import { Pressable, Text, View } from "react-native";

import { styles } from "@/features/profile/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function AccountSection({
  email,
  username,
  onSignOut,
}: {
  email: string;
  username?: string;
  onSignOut: () => void;
}) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const surfaceColor = Colors[theme].surfaceElevated;
  const borderColor = Colors[theme].border;
  const primaryTextColor = Colors[theme].text;
  const mutedTextColor = Colors[theme].mutedText;
  const dangerColor = Colors[theme].danger;

  return (
    <>
      <View style={[styles.info, { backgroundColor: surfaceColor }]}>
        <Text style={[styles.label, { color: mutedTextColor }]}>Signed in as</Text>
        {username ? <Text style={[styles.email, { color: primaryTextColor }]}>@{username}</Text> : null}
        <Text style={[styles.name, { color: mutedTextColor }]}>{email}</Text>
      </View>

      <Pressable
        style={[styles.signOutButton, { backgroundColor: dangerColor }]}
        onPress={onSignOut}
      >
        <Text style={[styles.signOutText, { color: "#fff" }]}>Sign Out</Text>
      </Pressable>
    </>
  );
}
