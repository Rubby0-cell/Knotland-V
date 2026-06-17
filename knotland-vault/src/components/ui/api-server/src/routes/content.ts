import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";
import { db, contentItemsTable, membersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const TIER_LEVELS: Record<string, number> = { standard: 1, vip: 2, lifetime: 3 };
const ROLE_MAX_TIER: Record<string, number> = { member: 1, vip: 2, admin: 3 };

function getMemberTierLevel(role: string, plan: string | null | undefined): number {
  const planTierLevel = plan ? (TIER_LEVELS[plan] ?? 0) : 0;
  const roleTierLevel = ROLE_MAX_TIER[role] ?? 1;
  return Math.max(planTierLevel, roleTierLevel);
}

router.get("/content", requireAuth, async (req, res): Promise<void> => {
  const tierFilter = req.query.tier as string | undefined;

  // Resolve member's plan from DB for accurate tier access (lifetime members have "vip" role but still need lifetime access)
  const [member] = await db
    .select({ plan: membersTable.plan, role: membersTable.role })
    .from(membersTable)
    .where(eq(membersTable.id, req.authUser!.id))
    .limit(1);

  const role = member?.role ?? req.authUser!.role;
  const plan = member?.plan;
  const memberTierLevel = getMemberTierLevel(role, plan);

  let query = db.select().from(contentItemsTable).$dynamic();

  if (tierFilter && ["standard", "vip", "lifetime"].includes(tierFilter)) {
    query = query.where(eq(contentItemsTable.tier_required, tierFilter as "standard" | "vip" | "lifetime"));
  }

  const items = await query.orderBy(contentItemsTable.created_at);

  res.json(items.map(i => {
    const requiredLevel = TIER_LEVELS[i.tier_required] ?? 1;
    const hasAccess = memberTierLevel >= requiredLevel;
    return {
      id: i.id,
      title: i.title,
      description: i.description,
      tier_required: i.tier_required,
      // Strip storage_path for content the member cannot access — prevents API scraping of locked content paths
      storage_path: hasAccess ? i.storage_path : null,
      content_type: i.content_type,
      thumbnail_url: i.thumbnail_url,
      created_at: i.created_at.toISOString(),
    };
  }));
});

router.post("/content/:id/signed-url", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [item] = await db
    .select()
    .from(contentItemsTable)
    .where(eq(contentItemsTable.id, id))
    .limit(1);

  if (!item) {
    res.status(404).json({ error: "Content not found" });
    return;
  }

  // Re-check tier access server-side (defence in depth)
  const [member] = await db
    .select({ plan: membersTable.plan, role: membersTable.role })
    .from(membersTable)
    .where(eq(membersTable.id, req.authUser!.id))
    .limit(1);

  const role = member?.role ?? req.authUser!.role;
  const memberTierLevel = getMemberTierLevel(role, member?.plan);
  const requiredLevel = TIER_LEVELS[item.tier_required] ?? 1;

  if (memberTierLevel < requiredLevel) {
    res.status(403).json({ error: "Access denied — upgrade your plan to access this content" });
    return;
  }

  // Generate signed URL using the user's own JWT so Supabase RLS is respected
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    res.status(500).json({ error: "Storage not configured" });
    return;
  }

  const token = req.headers.authorization!.slice(7);
  const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const EXPIRES_IN = 3600;
  const { data, error } = await userSupabase.storage
    .from("member-content")
    .createSignedUrl(item.storage_path, EXPIRES_IN);

  if (error || !data?.signedUrl) {
    logger.error({ error }, "Failed to generate signed URL for content item");
    res.status(500).json({ error: "Failed to generate access URL" });
    return;
  }

  res.json({ signed_url: data.signedUrl, expires_in: EXPIRES_IN });
});

export default router;
