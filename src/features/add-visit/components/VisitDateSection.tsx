import { Text, TextInput, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { styles } from "@/features/add-visit/styles";

export function VisitDateSection({
  date,
  setDate,
}: {
  date: string;
  setDate: (value: string) => void;
}) {
  const theme = useColorScheme() ?? "light";
  const c = Colors[theme];
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: c.text }]}>Visit Date</Text>
      <TextInput
        style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
        placeholderTextColor={c.mutedText}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
