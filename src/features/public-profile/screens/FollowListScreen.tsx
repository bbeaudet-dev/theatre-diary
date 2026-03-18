import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/convex/_generated/api";
import { styles } from "@/features/public-profile/styles";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type FollowKind = "followers" | "following";

export default function FollowListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ username?: string; kind?: string }>();
  const username = typeof params.username === "string" ? params.username : "";
  const kind: FollowKind = params.kind === "following" ? "following" : "followers";

  const profile = useQuery(
    api.profiles.getPublicProfileByUsername,
    username ? { username } : "skip"
  );
  const followers = useQuery(
    api.social.listFollowers,
    profile && kind === "followers" ? { userId: profile._id, limit: 100 } : "skip"
  );
  const following = useQuery(
    api.social.listFollowing,
    profile && kind === "following" ? { userId: profile._id, limit: 100 } : "skip"
  );

  const rows = kind === "followers" ? (followers ?? []) : (following ?? []);
  const title = kind === "followers" ? "Followers" : "Following";

  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";
  const backgroundColor = Colors[theme].background;
  const primaryTextColor = Colors[theme].text;
  const mutedTextColor = Colors[theme].mutedText;
  const surfaceColor = Colors[theme].surfaceElevated;
  const borderColor = Colors[theme].border;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={["bottom"]}>
      <Stack.Screen
        options={{ headerShown: true, title, headerBackButtonDisplayMode: "minimal" }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {(profile === undefined ||
          (kind === "followers" ? followers === undefined : following === undefined)) && (
          <Text style={[styles.loading, { color: mutedTextColor }]}>
            Loading {title.toLowerCase()}...
          </Text>
        )}
        {!profile ? null : rows.length === 0 ? (
          <Text style={[styles.loading, { color: mutedTextColor }]}>
            No {title.toLowerCase()} yet.
          </Text>
        ) : (
          rows.map((row) => (
            <Pressable
              key={row._id}
              style={[styles.listRow, { backgroundColor: surfaceColor, borderColor }]}
              onPress={() =>
                router.push({
                  pathname: "/user/[username]",
                  params: { username: row.username },
                })
              }
            >
              <Text style={[styles.rowTitle, { color: primaryTextColor }]}>
                {row.name?.trim() || row.username}
              </Text>
              <Text style={[styles.rowSubtitle, { color: mutedTextColor }]}>
                @{row.username}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
