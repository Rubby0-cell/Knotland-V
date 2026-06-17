import { type Request, type Response, type NextFunction } from "express";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { db, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn("SUPABASE_URL or SUPABASE_ANON_KEY not set — auth middleware will reject all requests");
    return null;
  }
  try {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    logger.error({ err }, "Failed to create Supabase client");
    return null;
  }
  return _supabase;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "member" | "vip" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const supabase = getSupabase();

  if (!supabase) {
    res.status(500).json({ error: "Auth not configured" });
    return;
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  // Upsert member profile
  const existing = await db.select().from(membersTable).where(eq(membersTable.id, user.id)).limit(1);
  let member = existing[0];

  if (!member) {
    const [created] = await db.insert(membersTable).values({
      id: user.id,
      email: user.email ?? "",
      role: "member",
      age_verified: false,
    }).returning();
    member = created;
  }

  req.authUser = {
    id: user.id,
    email: user.email ?? "",
    role: member.role as "member" | "vip" | "admin",
  };

  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, async () => {
    if (req.authUser?.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}
