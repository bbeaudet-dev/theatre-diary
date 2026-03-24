import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireConvexUserId } from "./auth";

export const listForCurrentUser = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await requireConvexUserId(ctx);
    const limit = Math.max(1, Math.min(args.limit ?? 50, 100));

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_createdAt", (q) => q.eq("recipientUserId", userId))
      .order("desc")
      .take(limit);

    const results = await Promise.all(
      notifications.map(async (notif) => {
        const actor = await ctx.db.get(notif.actorUserId);
        if (!actor) return null;

        const avatarUrl = actor.avatarImage
          ? await ctx.storage.getUrl(actor.avatarImage)
          : null;

        let show = null;
        if (notif.showId) {
          const showDoc = await ctx.db.get(notif.showId);
          if (showDoc) {
            const imageUrls = await Promise.all(
              showDoc.images.map((id) => ctx.storage.getUrl(id))
            );
            show = { ...showDoc, images: imageUrls.filter(Boolean) as string[] };
          }
        }

        return {
          _id: notif._id,
          type: notif.type,
          isRead: notif.isRead,
          createdAt: notif.createdAt,
          visitId: notif.visitId,
          actor: {
            _id: actor._id,
            username: actor.username,
            name: actor.name,
            avatarUrl,
          },
          show,
        };
      })
    );

    return results.filter((r): r is NonNullable<typeof r> => r !== null);
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireConvexUserId(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_isRead", (q) =>
        q.eq("recipientUserId", userId).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await requireConvexUserId(ctx);
    const notif = await ctx.db.get(args.notificationId);
    if (!notif) throw new Error("Notification not found");
    if (notif.recipientUserId !== userId) throw new Error("Not authorized");
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireConvexUserId(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_isRead", (q) =>
        q.eq("recipientUserId", userId).eq("isRead", false)
      )
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { isRead: true })));
  },
});
