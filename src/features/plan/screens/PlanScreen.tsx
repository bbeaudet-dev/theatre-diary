import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { ListsSection } from "@/features/profile/components/ListsSection";
import { useProfileListsData } from "@/features/profile/hooks/useProfileListsData";
import type { VisibleProfileList } from "@/features/profile/types";
import { TripCard } from "@/features/plan/components/TripCard";
import { CreateTripSheet } from "@/features/plan/components/CreateTripSheet";
import { useTripData } from "@/features/plan/hooks/useTripData";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Id } from "@/convex/_generated/dataModel";

export default function PlanScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const params = useLocalSearchParams<{ createList?: string; createTrip?: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  const backgroundColor = Colors[theme].background;
  const primaryTextColor = Colors[theme].text;
  const mutedTextColor = Colors[theme].mutedText;
  const surfaceColor = Colors[theme].surfaceElevated;
  const borderColor = Colors[theme].border;
  const accentColor = Colors[theme].accent;
  const chipBg = Colors[theme].surface;

  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [showPastTrips, setShowPastTrips] = useState(false);

  // Lists state (reused from Profile)
  const {
    profileLists,
    visibleLists,
    initializeSystemLists,
    createCustomList,
    toggleVisibility,
  } = useProfileListsData();

  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isShowingCreateInput, setIsShowingCreateInput] = useState(false);
  const [pendingVisibilityIds, setPendingVisibilityIds] = useState<Set<string>>(
    () => new Set()
  );
  const [listErrorMessage, setListErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const { trips, createTrip } = useTripData();

  useEffect(() => {
    initializeSystemLists().catch(() => undefined);
  }, [initializeSystemLists]);

  // Handle createList deep-link param (from ActionsMenu)
  useEffect(() => {
    if (params.createList !== "1") return;
    setIsShowingCreateInput(true);
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
      router.setParams({ createList: undefined });
    }, 40);
    return () => clearTimeout(timeout);
  }, [params.createList, router]);

  // Handle createTrip deep-link param (from ActionsMenu)
  useEffect(() => {
    if (params.createTrip !== "1") return;
    setShowCreateTrip(true);
    router.setParams({ createTrip: undefined });
  }, [params.createTrip, router]);

  const handleCreateCustomList = async () => {
    const trimmed = newListName.trim();
    if (!trimmed || isCreatingList) return;
    setListErrorMessage(null);
    setIsCreatingList(true);
    try {
      const listId = await createCustomList({ name: trimmed, isPublic: false });
      setNewListName("");
      setIsShowingCreateInput(false);
      router.push({
        pathname: "/list/[listId]",
        params: { listId: String(listId), name: trimmed },
      });
    } catch (error) {
      setListErrorMessage(
        error instanceof Error ? error.message : "Failed to create list"
      );
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleToggleVisibility = async (
    listId: Id<"userLists">,
    isPublic: boolean
  ) => {
    const key = String(listId);
    setPendingVisibilityIds((prev) => new Set(prev).add(key));
    try {
      await toggleVisibility(listId, isPublic);
    } finally {
      setPendingVisibilityIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const openList = (list: VisibleProfileList) => {
    router.push({
      pathname: "/list/[listId]",
      params: {
        listId: String(list._id),
        name: list.name,
        seen: list.isSeen ? "1" : "0",
        systemKey: list.systemKey ?? "",
      },
    });
  };

  const handleCreateTrip = async (args: {
    name: string;
    startDate: string;
    endDate: string;
    description?: string;
  }) => {
    const tripId = await createTrip({ ...args, isPublic: false });
    router.push({
      pathname: "/(tabs)/plan/[tripId]",
      params: { tripId: String(tripId) },
    });
  };

  const upcomingTrips = trips?.upcoming ?? [];
  const pastTrips = trips?.past ?? [];
  const isTripsLoading = trips === undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: primaryTextColor }]}>Plan</Text>
        </View>

        {/* Trips Section */}
        <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: primaryTextColor }]}>Trips</Text>
            <Pressable
              style={[styles.iconButton, { backgroundColor: chipBg, borderColor }]}
              onPress={() => setShowCreateTrip(true)}
            >
              <IconSymbol size={18} name="plus" color={primaryTextColor} />
            </Pressable>
          </View>

          {isTripsLoading ? (
            <Text style={[styles.emptyText, { color: mutedTextColor }]}>Loading…</Text>
          ) : upcomingTrips.length === 0 && pastTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: primaryTextColor }]}>
                No trips yet
              </Text>
              <Text style={[styles.emptySubtitle, { color: mutedTextColor }]}>
                Create a trip to plan which shows you want to see and track shows
                closing around your travel dates.
              </Text>
              <Pressable
                style={[styles.emptyButton, { backgroundColor: accentColor }]}
                onPress={() => setShowCreateTrip(true)}
              >
                <Text style={styles.emptyButtonText}>Create a Trip</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {upcomingTrips.map((trip) => (
                <TripCard
                  key={String(trip._id)}
                  name={trip.name}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                  showCount={trip.showCount}
                  isOwner={trip.isOwner}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/plan/[tripId]",
                      params: { tripId: String(trip._id) },
                    })
                  }
                />
              ))}

              {pastTrips.length > 0 ? (
                <>
                  <Pressable
                    style={styles.pastTripsToggle}
                    onPress={() => setShowPastTrips((v) => !v)}
                  >
                    <Text style={[styles.pastTripsToggleText, { color: mutedTextColor }]}>
                      {showPastTrips
                        ? "Hide past trips"
                        : `Show ${pastTrips.length} past trip${pastTrips.length === 1 ? "" : "s"}`}
                    </Text>
                    <Text style={[styles.pastChevron, { color: mutedTextColor }]}>
                      {showPastTrips ? "▲" : "▼"}
                    </Text>
                  </Pressable>

                  {showPastTrips
                    ? pastTrips.map((trip) => (
                        <TripCard
                          key={String(trip._id)}
                          name={trip.name}
                          startDate={trip.startDate}
                          endDate={trip.endDate}
                          showCount={trip.showCount}
                          isOwner={trip.isOwner}
                          isPast
                          onPress={() =>
                            router.push({
                              pathname: "/(tabs)/plan/[tripId]",
                              params: { tripId: String(trip._id) },
                            })
                          }
                        />
                      ))
                    : null}
                </>
              ) : null}
            </>
          )}
        </View>

        {/* Lists Section */}
        <ListsSection
          isShowingCreateInput={isShowingCreateInput}
          setIsShowingCreateInput={setIsShowingCreateInput}
          newListName={newListName}
          setNewListName={setNewListName}
          isCreatingList={isCreatingList}
          onCreateCustomList={handleCreateCustomList}
          inputRef={inputRef}
          profileListsLoading={profileLists === undefined}
          visibleLists={visibleLists}
          pendingVisibilityIds={pendingVisibilityIds}
          onToggleVisibility={handleToggleVisibility}
          openList={openList}
          errorMessage={listErrorMessage}
        />
      </ScrollView>

      <CreateTripSheet
        visible={showCreateTrip}
        onClose={() => setShowCreateTrip(false)}
        onCreate={handleCreateTrip}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  pageHeader: {
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  section: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  emptyButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    paddingVertical: 8,
  },
  pastTripsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  pastTripsToggleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pastChevron: {
    fontSize: 10,
  },
});
