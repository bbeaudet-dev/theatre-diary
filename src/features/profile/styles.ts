import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
    paddingBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  profileHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d4d4d4",
  },
  menuButtonText: {
    fontSize: 18,
    color: "#222",
    marginTop: -1,
  },
  profileHero: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e2e2",
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 6,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#eee",
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    fontSize: 28,
    fontWeight: "700",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },
  profileUsername: {
    fontSize: 14,
    fontWeight: "600",
  },
  profileCountsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 2,
  },
  profileCountText: {
    fontSize: 13,
    fontWeight: "600",
  },
  profileBio: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  profileLocation: {
    fontSize: 13,
  },
  info: {
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
  },
  name: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e2e2",
    borderRadius: 12,
    padding: 12,
    gap: 12,
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
    borderColor: "#d3d3d3",
  },
  inlineCreateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inlineInput: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "700",
    fontSize: 14,
  },
  inlineCreateButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  listRow: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  listName: {
    fontSize: 16,
    fontWeight: "600",
  },
  listMeta: {
    fontSize: 12,
  },
  listInfo: {
    flex: 1,
    gap: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  pendingText: {
    fontSize: 12,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  signOutButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
