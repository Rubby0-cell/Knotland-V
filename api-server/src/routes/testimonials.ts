import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, testimonialsTable, membersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/testimonials", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      t: testimonialsTable,
      display_name: membersTable.display_name,
    })
    .from(testimonialsTable)
    .leftJoin(membersTable, eq(testimonialsTable.member_id, membersTable.id))
    .where(eq(testimonialsTable.status, "approved"))
    .orderBy(desc(testimonialsTable.created_at));

  res.json(rows.map(r => ({
    id: r.t.id,
    member_id: r.t.member_id,
    display_name: r.display_name ?? null,
    content: r.t.content,
    rating: r.t.rating,
    status: r.t.status,
    created_at: r.t.created_at.toISOString(),
  })));
});

router.post("/testimonials", requireAuth, async (req, res): Promise<void> => {
  const { content, rating } = req.body;
  if (!content || rating == null) {
    res.status(400).json({ error: "content and rating are required" });
    return;
  }

  const [t] = await db.insert(testimonialsTable).values({
    member_id: req.authUser!.id,
    content,
    rating: Number(rating),
    status: "pending",
  }).returning();

  res.status(201).json({
    id: t.id,
    member_id: t.member_id,
    display_name: null,
    content: t.content,
    rating: t.rating,
    status: t.status,
    created_at: t.created_at.toISOString(),
  });
});

export default router;
