import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, paymentProofsTable, plansTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { notifyAdminNewPayment } from "../lib/notify";

const router: IRouter = Router();

router.get("/payments", requireAuth, async (req, res): Promise<void> => {
  const proofs = await db
    .select({
      proof: paymentProofsTable,
      plan_name: plansTable.name,
    })
    .from(paymentProofsTable)
    .leftJoin(plansTable, eq(paymentProofsTable.plan_id, plansTable.id))
    .where(eq(paymentProofsTable.member_id, req.authUser!.id))
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

router.post("/payments", requireAuth, async (req, res): Promise<void> => {
  const { plan_id, screenshot_url, notes } = req.body;
  if (!plan_id || !screenshot_url) {
    res.status(400).json({ error: "plan_id and screenshot_url are required" });
    return;
  }

  const plan = await db.select().from(plansTable).where(eq(plansTable.id, Number(plan_id))).limit(1);
  if (!plan[0]) {
    res.status(404).json({ error: "Plan not found" });
    return;
  }

  const [proof] = await db.insert(paymentProofsTable).values({
    member_id: req.authUser!.id,
    plan_id: Number(plan_id),
    screenshot_url,
    notes: notes ?? null,
    status: "pending",
  }).returning();

  // Fire-and-forget admin email notification
  notifyAdminNewPayment({
    planName: plan[0].name,
    notes: notes ?? null,
    submittedAt: proof.submitted_at.toISOString(),
  }).catch(() => {});

  res.status(201).json({
    id: proof.id,
    member_id: proof.member_id,
    plan_id: proof.plan_id,
    plan_name: plan[0].name,
    screenshot_url: proof.screenshot_url,
    status: proof.status,
    notes: proof.notes,
    submitted_at: proof.submitted_at.toISOString(),
    reviewed_at: null,
  });
});

export default router;
