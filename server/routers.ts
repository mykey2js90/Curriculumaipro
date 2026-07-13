import Stripe from "stripe";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, type Message } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createBlogPost,
  createSponsor,
  deleteBlogPost,
  getBlogPostBySlug,
  getBlogPosts,
  getNewsletterAnalytics,
  getNewsletterSubscribers,
  getSponsors,
  getUserCurricula,
  recordSponsorClick,
  recordSponsorImpression,
  saveCurriculum,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  updateBlogPost,
  updateSponsor,
  updateUserStripe,
} from "./db";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

export const STRIPE_PRODUCTS = {
  pro_monthly: {
    name: "CurriculumAI Pro (Monthly)",
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    amount: 1900,
    interval: "month" as const,
  },
  pro_annual: {
    name: "CurriculumAI Pro (Annual)",
    priceId: process.env.STRIPE_PRICE_PRO_ANNUAL ?? "",
    amount: 15900,
    interval: "year" as const,
  },
} as const;

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().optional() }))
      .mutation(async ({ input }) => {
        await subscribeToNewsletter(input.email, input.name);
        return { success: true };
      }),
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await unsubscribeFromNewsletter(input.email);
        return { success: true };
      }),
    list: protectedProcedure
      .input(z.object({ activeOnly: z.boolean().default(true) }).optional())
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        return getNewsletterSubscribers(input?.activeOnly ?? true);
      }),
    analytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      return getNewsletterAnalytics();
    }),
  }),

  blog: router({
    list: publicProcedure
      .input(z.object({ publishedOnly: z.boolean().default(true) }).optional())
      .query(async ({ input }) => {
        const posts = await getBlogPosts(input?.publishedOnly ?? true);
        return posts.map((p) => ({ ...p, tags: p.tags ? (JSON.parse(p.tags) as string[]) : [] }));
      }),
    get: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await getBlogPostBySlug(input.slug);
        if (!post) return null;
        return { ...post, tags: post.tags ? (JSON.parse(post.tags) as string[]) : [] };
      }),
    create: protectedProcedure
      .input(z.object({
        slug: z.string(), title: z.string(), excerpt: z.string().optional(),
        content: z.string(), coverImage: z.string().optional(),
        authorName: z.string().optional(), authorAvatar: z.string().optional(),
        tags: z.array(z.string()).optional(), published: z.boolean().default(false),
        publishedAt: z.date().optional(), readingTimeMinutes: z.number().int().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        await createBlogPost(input);
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(), title: z.string().optional(), excerpt: z.string().optional(),
        content: z.string().optional(), coverImage: z.string().optional(),
        authorName: z.string().optional(), authorAvatar: z.string().optional(),
        tags: z.array(z.string()).optional(), published: z.boolean().optional(),
        publishedAt: z.date().optional(), readingTimeMinutes: z.number().int().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        const { id, ...data } = input;
        await updateBlogPost(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        await deleteBlogPost(input.id);
        return { success: true };
      }),
  }),

  curriculum: router({
    generate: protectedProcedure
      .input(z.object({
        topic: z.string().min(3).max(500),
        numModules: z.number().int().min(3).max(20).default(8),
        level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
      }))
      .mutation(async ({ input, ctx }) => {
        const userPrompt = `Create a ${input.level} level course curriculum for: "${input.topic}".
Include ${input.numModules} modules. Each module: moduleNumber, title, description, learningObjectives (3-5), estimatedDuration, topics (4-8).
Top-level: courseTitle, courseDescription, targetAudience, prerequisites, totalDuration.
Respond ONLY with valid JSON.`;
        const response = await invokeLLM({
          messages: [
            { role: "system" as const, content: "You are an expert instructional designer. Generate structured course curricula in JSON." } as Message,
            { role: "user" as const, content: userPrompt } as Message,
          ],
          response_format: { type: "json_object" },
        });
        const rawContent = response.choices?.[0]?.message?.content ?? "{}";
        const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
        const curriculum = JSON.parse(content);
        await saveCurriculum({
          userId: ctx.user.id, topic: input.topic,
          title: curriculum.courseTitle ?? input.topic,
          content: JSON.stringify(curriculum), format: "json",
        });
        return curriculum;
      }),
    history: protectedProcedure.query(async ({ ctx }) => getUserCurricula(ctx.user.id)),
  }),

  sponsors: router({
    list: publicProcedure.query(async () => getSponsors(true)),
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      return getSponsors(false);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(), logoUrl: z.string().optional(), websiteUrl: z.string().optional(),
        description: z.string().optional(),
        tier: z.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
        startDate: z.date().optional(), endDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        await createSponsor(input);
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(), name: z.string().optional(), logoUrl: z.string().optional(),
        websiteUrl: z.string().optional(), description: z.string().optional(),
        tier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
        isActive: z.boolean().optional(), startDate: z.date().optional(), endDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        const { id, ...data } = input;
        await updateSponsor(id, data);
        return { success: true };
      }),
    recordImpression: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await recordSponsorImpression(input.id); return { success: true }; }),
    recordClick: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => { await recordSponsorClick(input.id); return { success: true }; }),
    analytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      return getSponsors(false);
    }),
  }),

  stripe: router({
    createCheckout: protectedProcedure
      .input(z.object({ priceId: z.string(), origin: z.string().url() }))
      .mutation(async ({ input, ctx }) => {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          customer_email: ctx.user.email ?? undefined,
          line_items: [{ price: input.priceId, quantity: 1 }],
          allow_promotion_codes: true,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email ?? "",
            customer_name: ctx.user.name ?? "",
          },
          success_url: `${input.origin}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/subscription-cancel`,
        });
        return { url: session.url };
      }),
    subscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.stripeSubscriptionId) return { status: "none", plan: null };
      try {
        const stripe = getStripe();
        const sub = await stripe.subscriptions.retrieve(ctx.user.stripeSubscriptionId);
        return { status: sub.status, plan: sub.items.data[0]?.price?.id ?? null };
      } catch {
        return { status: "error", plan: null };
      }
    }),
    products: publicProcedure.query(() => STRIPE_PRODUCTS),
  }),
});

export type AppRouter = typeof appRouter;
