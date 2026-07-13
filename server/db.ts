import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  blogPosts,
  curricula,
  newsletterSubscribers,
  sponsors,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserStripe(
  userId: number,
  data: { stripeCustomerId?: string; stripeSubscriptionId?: string; subscriptionStatus?: string }
) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

export async function subscribeToNewsletter(email: string, name?: string, source = "website") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(newsletterSubscribers)
    .values({ email, name: name ?? null, source, isActive: true })
    .onDuplicateKeyUpdate({ set: { isActive: true, name: name ?? sql`name` } });
}

export async function unsubscribeFromNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(newsletterSubscribers)
    .set({ isActive: false })
    .where(eq(newsletterSubscribers.email, email));
}

export async function getNewsletterSubscribers(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = activeOnly ? [eq(newsletterSubscribers.isActive, true)] : [];
  return db
    .select()
    .from(newsletterSubscribers)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(newsletterSubscribers.createdAt));
}

export async function getNewsletterAnalytics() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, inactive: 0 };
  const rows = await db
    .select({ isActive: newsletterSubscribers.isActive, count: sql<number>`count(*)` })
    .from(newsletterSubscribers)
    .groupBy(newsletterSubscribers.isActive);
  let total = 0, active = 0, inactive = 0;
  for (const r of rows) {
    const n = Number(r.count);
    total += n;
    if (r.isActive) active += n; else inactive += n;
  }
  return { total, active, inactive };
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export async function getBlogPosts(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = publishedOnly ? [eq(blogPosts.published, true)] : [];
  return db
    .select()
    .from(blogPosts)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.publishedAt));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBlogPost(data: {
  slug: string; title: string; excerpt?: string; content: string;
  coverImage?: string; authorName?: string; authorAvatar?: string;
  tags?: string[]; published?: boolean; publishedAt?: Date; readingTimeMinutes?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(blogPosts).values({
    ...data,
    tags: data.tags ? JSON.stringify(data.tags) : null,
    published: data.published ?? false,
  });
}

export async function updateBlogPost(id: number, data: Partial<{
  title: string; excerpt: string; content: string; coverImage: string;
  authorName: string; authorAvatar: string; tags: string[];
  published: boolean; publishedAt: Date; readingTimeMinutes: number;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const update: Record<string, unknown> = { ...data };
  if (data.tags) update.tags = JSON.stringify(data.tags);
  await db.update(blogPosts).set(update).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// ─── Sponsors ──────────────────────────────────────────────────────────────────

export async function getSponsors(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = activeOnly ? [eq(sponsors.isActive, true)] : [];
  return db
    .select()
    .from(sponsors)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(sponsors.createdAt));
}

export async function createSponsor(data: {
  name: string; logoUrl?: string; websiteUrl?: string; description?: string;
  tier?: "bronze" | "silver" | "gold" | "platinum"; startDate?: Date; endDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(sponsors).values({ ...data, isActive: true, impressions: 0, clicks: 0 });
}

export async function updateSponsor(id: number, data: Partial<{
  name: string; logoUrl: string; websiteUrl: string; description: string;
  tier: "bronze" | "silver" | "gold" | "platinum"; isActive: boolean;
  startDate: Date; endDate: Date;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(sponsors).set(data).where(eq(sponsors.id, id));
}

export async function recordSponsorImpression(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(sponsors).set({ impressions: sql`impressions + 1` }).where(eq(sponsors.id, id));
}

export async function recordSponsorClick(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(sponsors).set({ clicks: sql`clicks + 1` }).where(eq(sponsors.id, id));
}

// ─── Curricula ───────────────────────────────────────────────────────────────────

export async function saveCurriculum(data: {
  userId: number; topic: string; title?: string; content: string; format?: "json" | "csv" | "pdf";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(curricula).values({ ...data, format: data.format ?? "json" });
}

export async function getUserCurricula(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(curricula).where(eq(curricula.userId, userId)).orderBy(desc(curricula.createdAt));
}
