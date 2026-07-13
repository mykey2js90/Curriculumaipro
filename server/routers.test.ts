/**
 * CurriculumAI — tRPC Router Tests
 *
 * Tests for the main application routers: auth, newsletter, blog, sponsors.
 * The curriculum router requires a live LLM connection and is excluded from unit tests.
 */
import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─────────────────────────────────────────────────────────────────────────────
// Mock the database helpers so tests run without a real DB connection
// ─────────────────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  updateUserStripe: vi.fn().mockResolvedValue(undefined),
  // Newsletter
  subscribeToNewsletter: vi.fn().mockResolvedValue({ success: true }),
  unsubscribeFromNewsletter: vi.fn().mockResolvedValue({ success: true }),
  getNewsletterSubscribers: vi.fn().mockResolvedValue([]),
  getNewsletterAnalytics: vi.fn().mockResolvedValue({ total: 5, active: 4, inactive: 1 }),
  // Blog
  getBlogPosts: vi.fn().mockResolvedValue([]),
  getBlogPostBySlug: vi.fn().mockResolvedValue(null),
  createBlogPost: vi.fn().mockResolvedValue({ id: 1, slug: "test-post" }),
  updateBlogPost: vi.fn().mockResolvedValue({ id: 1 }),
  deleteBlogPost: vi.fn().mockResolvedValue(undefined),
  // Sponsors
  getSponsors: vi.fn().mockResolvedValue([]),
  createSponsor: vi.fn().mockResolvedValue({ id: 1, name: "Test Sponsor", tier: "gold", isActive: true, impressions: 0, clicks: 0 }),
  updateSponsor: vi.fn().mockResolvedValue({ id: 1 }),
  recordSponsorImpression: vi.fn().mockResolvedValue(undefined),
  recordSponsorClick: vi.fn().mockResolvedValue(undefined),
  // Curricula
  saveCurriculum: vi.fn().mockResolvedValue({ id: 1 }),
  getUserCurricula: vi.fn().mockResolvedValue([]),
  getUserSubscription: vi.fn().mockResolvedValue(null),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build minimal tRPC contexts
// ─────────────────────────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-open-id",
      email: "admin@curriculumaipro.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-open-id",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns null for unauthenticated requests", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    expect(await caller.auth.me()).toBeNull();
  });

  it("returns the user object for authenticated requests", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.auth.me();
    expect(result?.email).toBe("user@example.com");
    expect(result?.role).toBe("user");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Newsletter
// ─────────────────────────────────────────────────────────────────────────────
describe("newsletter.subscribe", () => {
  it("subscribes a valid email address", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.newsletter.subscribe({ email: "test@example.com" });
    expect(result).toMatchObject({ success: true });
  });

  it("rejects an invalid email address", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.newsletter.subscribe({ email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("accepts an optional name field", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.newsletter.subscribe({
      email: "named@example.com",
      name: "Test User",
    });
    expect(result).toMatchObject({ success: true });
  });
});

describe("newsletter.unsubscribe", () => {
  it("unsubscribes a valid email address", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.newsletter.unsubscribe({ email: "test@example.com" });
    expect(result).toMatchObject({ success: true });
  });
});

describe("newsletter.list", () => {
  it("is accessible to admin users", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.newsletter.list({ activeOnly: true });
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.newsletter.list({ activeOnly: true })).rejects.toThrow();
  });
});

describe("newsletter.analytics", () => {
  it("returns total, active, and inactive counts for admins", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.newsletter.analytics();
    expect(result).toMatchObject({
      total: expect.any(Number),
      active: expect.any(Number),
      inactive: expect.any(Number),
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Blog
// ─────────────────────────────────────────────────────────────────────────────
describe("blog.list", () => {
  it("returns an array of published posts", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.blog.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("blog.get", () => {
  it("returns null for a non-existent slug", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.blog.get({ slug: "does-not-exist" });
    expect(result).toBeNull();
  });
});

describe("blog.create", () => {
  it("allows admin users to create posts", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.blog.create({
      title: "Test Post",
      slug: "test-post",
      content: "# Hello World",
      tags: ["test"],
      isPublished: true,
    });
    expect(result).toMatchObject({ id: 1 });
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.blog.create({
        title: "Unauthorized Post",
        slug: "unauthorized",
        content: "# Nope",
        tags: [],
        isPublished: false,
      })
    ).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sponsors
// ─────────────────────────────────────────────────────────────────────────────
describe("sponsors.list", () => {
  it("returns an array of active sponsors for public users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.sponsors.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("sponsors.create", () => {
  it("allows admin users to create a sponsor", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.sponsors.create({
      name: "Test Sponsor",
      tier: "gold",
    });
    expect(result).toMatchObject({ id: 1, name: "Test Sponsor" });
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.sponsors.create({ name: "Hack Sponsor", tier: "bronze" })
    ).rejects.toThrow();
  });
});
