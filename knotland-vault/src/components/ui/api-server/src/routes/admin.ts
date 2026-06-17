import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, membersTable, paymentProofsTable, testimonialsTable, plansTable, announcementsTable, contentItemsTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/admin/members", requireAdmin, async (_req, res): Promise<void> => {
  const members = await db.select().from(membersTable).orderBy(desc(membersTable.created_at));
  res.json(members.map(m => ({
    id: m.id,
    email: m.email,
    display_name: m.display_name,
    role: m.role,
    plan: m.plan,
    age_verified: m.age_verified,
    created_at: m.created_at.toISOString(),
  })));
});

router.patch("/admin/members/:id", requireAdmin, async (req, res): Promise<void> => {
  const memberId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { role, plan, plan_expires_at, age_verified } = req.body;

  const updates: Partial<typeof membersTable.$inferInsert> = {};
  if (role) updates.role = role;
  if (plan !== undefined) updates.plan = plan;
  if (plan_expires_at !== undefined) updates.plan_expires_at = plan_expires_at ? new Date(plan_expires_at) : null;
  if (age_verified !== undefined) updates.age_verified = age_verified;

  const [updated] = await db.update(membersTable).set(updates).where(eq(membersTable.id, memberId)).returning();
  if (!updated) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  res.json({
    id: updated.id,
    email: updated.email,
    display_name: updated.display_name,
    role: updated.role,
    plan: updated.plan,
    age_verified: updated.age_verified,
    created_at: updated.created_at.toISOString(),
  });
});

router.get("/admin/payments", requireAdmin, async (_req, res): Promise<void> => {
  const proofs = await db
    .select({ proof: paymentProofsTable, plan_name: plansTable.name })
    .from(paymentProofsTable)
    .leftJoin(plansTable, eq(paymentProofsTable.plan_id, plansTable.id))
    .orderBy(desc(paymentProofsTable.submitted_at));

  res.json(proofs.map(r => ({
    id: r.proof.id,
    member_id: r.proof.member_id,
    plan_id: r.proof.plan_id,
    plan_name: r.plan_name ?? "Unknown",
    screenshot_url: r.proof.screenshot_url,
    status: r.proof.status,
    notes: r.proof.notes,
    submitted_at: r.proof.submitted_at.toISOString(),
    reviewed_at: r.proof.reviewed_at?.toISOString() ?? null,
  })));
});

router.patch("/admin/payments/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { status, notes } = req.body;
  if (!status || !["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "status must be approved or rejected" });
    return;
  }

  const updates: Partial<typeof paymentProofsTable.$inferInsert> = {
    status,
    reviewed_at: new Date(),
  };
  if (notes !== undefined) updates.notes = notes;

  const [updated] = await db.update(paymentProofsTable).set(updates).where(eq(paymentProofsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Payment proof not found" });
    return;
  }

  // If approved, update member plan
  if (status === "approved") {
    const plan = await db.select().from(plansTable).where(eq(plansTable.id, updated.plan_id)).limit(1);
    if (plan[0]) {
      const expiresAt = plan[0].duration_days
        ? new Date(Date.now() + plan[0].duration_days * 86400000)
        : null;
      const tierToRole: Record<string, "member" | "vip"> = {
        standard: "member",
        vip: "vip",
        lifetime: "vip",
      };
      await db.update(membersTable).set({
        plan: plan[0].tier,
        plan_expires_at: expiresAt,
        role: tierToRole[plan[0].tier] ?? "member",
      }).where(eq(membersTable.id, updated.member_id));
    }
  }

  const plan = await db.select().from(plansTable).where(eq(plansTable.id, updated.plan_id)).limit(1);
  res.json({
    id: updated.id,
    member_id: updated.member_id,
    plan_id: updated.plan_id,
    plan_name: plan[0]?.name ?? "Unknown",
    screenshot_url: updated.screenshot_url,
    status: updated.status,
    notes: updated.notes,
    submitted_at: updated.submitted_at.toISOString(),
    reviewed_at: updated.reviewed_at?.toISOString() ?? null,
  });
});

router.patch("/admin/testimonials/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { status } = req.body;
  if (!status || !["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "status must be approved or rejected" });
    return;
  }

  const [updated] = await db
    .update(testimonialsTable)
    .set({ status })
    .where(eq(testimonialsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Testimonial not found" });
    return;
  }

  const member = await db.select({ display_name: membersTable.display_name })
    .from(membersTable).where(eq(membersTable.id, updated.member_id)).limit(1);

  res.json({
    id: updated.id,
    member_id: updated.member_id,
    display_name: member[0]?.display_name ?? null,
    content: updated.content,
    rating: updated.rating,
    status: updated.status,
    created_at: updated.created_at.toISOString(),
  });
});

router.get("/admin/content", requireAdmin, async (_req, res): Promise<void> => {
  const items = await db.select().from(contentItemsTable).orderBy(desc(contentItemsTable.created_at));
  res.json(items.map(i => ({
    id: i.id,
    title: i.title,
    description: i.description,
    tier_required: i.tier_required,
    storage_path: i.storage_path,
    content_type: i.content_type,
    thumbnail_url: i.thumbnail_url,
    created_at: i.created_at.toISOString(),
  })));
});

router.post("/admin/content", requireAdmin, async (req, res): Promise<void> => {
  const { title, description, tier_required, storage_path, content_type, thumbnail_url } = req.body;
  if (!title || !tier_required || !storage_path || !content_type) {
    res.status(400).json({ error: "title, tier_required, storage_path, and content_type are required" });
    return;
  }
  if (!["standard", "vip", "lifetime"].includes(tier_required)) {
    res.status(400).json({ error: "tier_required must be standard, vip, or lifetime" });
    return;
  }

  const [item] = await db.insert(contentItemsTable).values({
    title,
    description: description ?? null,
    tier_required: tier_required as "standard" | "vip" | "lifetime",
    storage_path,
    content_type,
    thumbnail_url: thumbnail_url ?? null,
  }).returning();

  res.status(201).json({
    id: item.id,
    title: item.title,
    description: item.description,
    tier_required: item.tier_required,
    storage_path: item.storage_path,
    content_type: item.content_type,
    thumbnail_url: item.thumbnail_url,
    created_at: item.created_at.toISOString(),
  });
});

router.patch("/admin/content/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { title, description, tier_required, content_type, thumbnail_url } = req.body;
  const updates: Partial<typeof contentItemsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (tier_required !== undefined) {
    if (!["standard", "vip", "lifetime"].includes(tier_required)) {
      res.status(400).json({ error: "tier_required must be standard, vip, or lifetime" });
      return;
    }
    updates.tier_required = tier_required as "standard" | "vip" | "lifetime";
  }
  if (content_type !== undefined) updates.content_type = content_type;
  if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;

  const [updated] = await db.update(contentItemsTable).set(updates).where(eq(contentItemsTable.id, id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Content item not found" });
    return;
  }

  res.json({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    tier_required: updated.tier_required,
    storage_path: updated.storage_path,
    content_type: updated.content_type,
    thumbnail_url: updated.thumbnail_url,
    created_at: updated.created_at.toISOString(),
  });
});

router.delete("/admin/content/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(contentItemsTable).where(eq(contentItemsTable.id, id));
  res.sendStatus(204);
});

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [totalMembers] = await db.select({ count: db.$count(membersTable) }).from(membersTable);
  const pendingPayments = await db.select().from(paymentProofsTable).where(eq(paymentProofsTable.status, "pending"));
  const pendingTestimonials = await db.select().from(testimonialsTable).where(eq(testimonialsTable.status, "pending"));
  const vipMembers = await db.select().from(membersTable).where(eq(membersTable.plan, "vip"));
  const lifetimeMembers = await db.select().from(membersTable).where(eq(membersTable.plan, "lifetime"));
  const approvedMembers = await db.select().from(membersTable).where(eq(membersTable.role, "vip"));

  res.json({
    total_members: Number(totalMembers?.count ?? 0),
    pending_payments: pendingPayments.length,
    pending_testimonials: pendingTestimonials.length,
    approved_members: approvedMembers.length,
    vip_members: vipMembers.length,
    lifetime_members: lifetimeMembers.length,
  });
});

export default router;
