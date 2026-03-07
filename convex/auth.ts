import type { GenericCtx } from "@convex-dev/better-auth";
import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { v } from "convex/values";
import type { DataModel, Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { authComponent, onCreate, onDelete, onUpdate } from "./authFactory";

export { onCreate, onUpdate, onDelete };

type DbCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

export async function getConvexUserId(
  ctx: DbCtx
): Promise<Id<"users"> | null> {
  const authUser = await authComponent.safeGetAuthUser(
    ctx as GenericCtx<DataModel>
  );

  if (!authUser?._id) return null;

  const convexUser = await ctx.db
    .query("users")
    .withIndex("by_betterAuthUserId", (q) =>
      q.eq("betterAuthUserId", authUser._id)
    )
    .first();

  return convexUser?._id ?? null;
}

export const getConvexUserIdQuery = query({
  args: {},
  returns: v.union(v.id("users"), v.null()),
  handler: async (ctx) => {
    return await getConvexUserId(ctx);
  },
});

export async function requireConvexUserId(ctx: DbCtx): Promise<Id<"users">> {
  const userId = await getConvexUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}
