import { useMutation, useQuery } from "convex/react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { IconSymbol } from "@/components/ui/icon-symbol";

const SYSTEM_LIST_INFO: Record<string, string> = {
  seen:
    "This list is auto-generated from all of your saved visits.",
  uncategorized:
    "Newly announced shows are auto-added here. Shows are auto-removed once added to your Visits or to another List.",
  want_to_see:
    "Shows you plan to see soon. Moving a show here removes it from Uncategorized and Look Into.",
  look_into:
    "A shortlist for shows you want to research more before deciding.",
  not_interested:
    "Shows you have no current interest in seeing.",
};

export default function ListDetailScreen() {
  const params = useLocalSearchParams<{
    listId?: string;
    name?: string;
    seen?: string;
    systemKey?: string;
  }>();
  const listId = params.listId ?? "";
  const isSeen = params.seen === "1" || listId === "seen";
  const systemKey = typeof params.systemKey === "string" ? params.systemKey : undefined;
  const title = typeof params.name === "string" && params.name.trim().length > 0
    ? params.name
    : "List";
  const updateCustomListDescription = useMutation(api.lists.updateCustomListDescription);

  const seenList = useQuery(api.lists.getSeenDerivedList, isSeen ? {} : "skip");
  const regularList = useQuery(
    api.lists.getListById,
    !isSeen && listId ? { listId: listId as Id<"userLists"> } : "skip"
  );

  const rows = (isSeen ? (seenList?.shows ?? []) : (regularList?.shows ?? [])) as {
    _id: string;
    name: string;
  }[];
  const count = rows.length;
  const isSystemList = isSeen || regularList?.kind === "system";
  const infoText = useMemo(() => {
    if (isSeen) return SYSTEM_LIST_INFO.seen;
    if (!systemKey) return "This is a system list with automatic behavior.";
    return SYSTEM_LIST_INFO[systemKey] ?? "This is a system list with automatic behavior.";
  }, [isSeen, systemKey]);
  const [showInfo, setShowInfo] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  useEffect(() => {
    if (!regularList || regularList.kind !== "custom") return;
    setDescriptionDraft(regularList.description ?? "");
  }, [regularList]);

  const saveDescription = async () => {
    if (!regularList || regularList.kind !== "custom") return;
    setIsSavingDescription(true);
    try {
      await updateCustomListDescription({
        listId: regularList._id,
        description: descriptionDraft.trim() || undefined,
      });
    } finally {
      setIsSavingDescription(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen
        options={{
          title,
          headerShown: true,
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      <View style={styles.headerRow}>
        {isSystemList ? (
          <Pressable style={styles.infoButton} onPress={() => setShowInfo((prev) => !prev)}>
            <IconSymbol size={14} name="info.circle" color="#2c67b8" />
            <Text style={styles.infoButtonText}>What is this list?</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <Text style={styles.countText}>{count} shows</Text>
      </View>
      {showInfo && isSystemList ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>{infoText}</Text>
        </View>
      ) : null}

      {!isSystemList && regularList ? (
        <View style={styles.descriptionBlock}>
          <TextInput
            style={styles.descriptionInput}
            value={descriptionDraft}
            onChangeText={setDescriptionDraft}
            placeholder="Add a short description..."
            multiline
          />
          <Pressable
            style={[styles.saveDescriptionButton, isSavingDescription && styles.disabledButton]}
            onPress={saveDescription}
            disabled={isSavingDescription}
          >
            <Text style={styles.saveDescriptionText}>
              {isSavingDescription ? "Saving..." : "Save"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.content}>
        {rows.length === 0 ? (
          <Text style={styles.emptyText}>No shows in this list yet.</Text>
        ) : (
          rows.map((show) => (
            <View key={show._id} style={styles.row}>
              <Text style={styles.name}>{show.name}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e1e1e1",
  },
  infoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoButtonText: {
    fontSize: 13,
    color: "#2c67b8",
    fontWeight: "600",
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c6dcff",
    backgroundColor: "#eef5ff",
    padding: 10,
  },
  infoText: {
    fontSize: 13,
    color: "#34507a",
    lineHeight: 18,
  },
  descriptionBlock: {
    marginHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  descriptionInput: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 64,
    textAlignVertical: "top",
  },
  saveDescriptionButton: {
    alignSelf: "flex-end",
    borderRadius: 8,
    backgroundColor: "#222",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  saveDescriptionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  countText: {
    fontSize: 13,
    color: "#777",
    fontWeight: "600",
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  emptyText: {
    fontSize: 15,
    color: "#8a8a8a",
  },
  row: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 16,
    color: "#222",
    fontWeight: "600",
  },
});
