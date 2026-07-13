/**
 * Vercel Serverless Function entry point.
 *
 * This file wraps the Express application for deployment on Vercel.
 * All /api/* requests are handled here; the frontend SPA is served
 * from the dist/public directory via the rewrites in vercel.json.
 *
 * IMPORTANT: Vercel Serverless Functions have a 250MB compressed size limit.
 * The node_modules are bundled by esbuild during `pnpm build`.
 */
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { registerStorageProxy } from "../server/_core/storageProxy";
import { registerStripeWebhook } from "../server/stripeWebhook";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();

// Stripe webhook MUST be registered before express.json() to receive raw body
registerStripeWebhook(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
