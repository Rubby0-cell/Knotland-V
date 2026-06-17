import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, membersTable, announcementsTable, contentItemsTable, paymentProofsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/members/profile", requireAuth, async (req, res): Promise<void> => {
  const member = await db.select().from(membersTable).where(eq(membersTable.id, req.authUser!.id)).limit(1);
  if (!member[0]) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  const m = member[0];
  res.json({
    id: m.id,
    email: m.email,
    display_name: m.display_name,
    avatar_url: m.avatar_url,
    role: m.role,
    plan: m.plan,
    plan_expires_at: m.plan_expires_at?.toISOString() ?? null,
    age_verified: m.age_verified,
    bio: m.bio,
    created_at: m.created_at.toISOString(),
  });
});

router.patch("/members/profile", requireAuth, async (req, res): Promise<void> => {
  const { display_name, bio, avatar_url } = req.body;
  const updates: Partial<typeof membersTable.$inferInsert> = {};
  if (display_name !== undefined) updates.display_name = display_name;
  if (bio !== undefined) updates.bio = bio;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const [updated] = await db.update(membersTable).set(updates).where(eq(membersTable.id, req.authUser!.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  res.json({
    id: updated.id,
    email: updated.email,
    display_name: updated.display_name,
    avatar_url: updated.avatar_url,
    role: updated.role,
    plan: updated.plan,
    plan_expires_at: updated.plan_expires_at?.toISOString() ?? null,
    age_verified: updated.age_verified,
    bio: updated.bio,
    created_at: updated.created_at.toISOString(),
  });
});

router.get("/members/dashboard-stats", requireAuth, async (req, res): Promise<void> => {
  const [totalMembers] = await db.select({ count: db.$count(membersTable) }).from(membersTable);
  const [activeAnnouncements] = await db.select({ count: db.$count(announcementsTable) }).from(announcementsTable);
  const [contentCount] = await db.select({ count: db.$count(contentItemsTable) }).from(contentItemsTable);

  const myPayments = await db.select().from(paymentProofsTable).where(eq(paymentProofsTable.member_id, req.authUser!.id)).orderBy(desc(paymentProofsTable.submitted_at)).limit(1);
  const latestPayment = myPayments[0];

  res.json({
    total_members: Number(totalMembers?.count ?? 0),
    active_announcements: Number(activeAnnouncements?.count ?? 0),
    my_payment_status: latestPayment?.status ?? null,
    content_items_available: Number(contentCount?.count ?? 0),
  });
});

export default router;
