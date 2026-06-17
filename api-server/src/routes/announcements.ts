import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, announcementsTable, membersTable } from "@workspace/db";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/announcements", requireAuth, async (req, res): Promise<void> => {
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;

  const rows = await db
    .select({
      ann: announcementsTable,
      author_name: membersTable.display_name,
    })
    .from(announcementsTable)
    .leftJoin(membersTable, eq(announcementsTable.author_id, membersTable.id))
    .orderBy(desc(announcementsTable.pinned), desc(announcementsTable.created_at))
    .limit(limit);

  res.json(rows.map(r => ({
    id: r.ann.id,
    title: r.ann.title,
    body: r.ann.body,
    pinned: r.ann.pinned,
    created_at: r.ann.created_at.toISOString(),
    author_name: r.author_name ?? null,
  })));
});

router.post("/announcements", requireAdmin, async (req, res): Promise<void> => {
  const { title, body, pinned } = req.body;
  if (!title || !body) {
    res.status(400).json({ error: "title and body are required" });
    return;
  }

  const [ann] = await db.insert(announcementsTable).values({
    title,
    body,
    pinned: pinned ?? false,
    author_id: req.authUser!.id,
  }).returning();

  res.status(201).json({
    id: ann.id,
    title: ann.title,
    body: ann.body,
    pinned: ann.pinned,
    created_at: ann.created_at.toISOString(),
    author_name: null,
  });
});

router.delete("/announcements/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  res.sendStatus(204);
});

export default router;
