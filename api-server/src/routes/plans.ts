import { Router, type IRouter } from "express";
import { db, plansTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/plans", async (_req, res): Promise<void> => {
  const plans = await db.select().from(plansTable).where(eq(plansTable.is_active, true)).orderBy(plansTable.id);
  res.json(plans.map(p => ({
    id: p.id,
    name: p.name,
    tier: p.tier,
    price_usd: Number(p.price_usd),
    description: p.description,
    features: p.features ?? [],
    duration_days: p.duration_days,
  })));
});

export default router;
