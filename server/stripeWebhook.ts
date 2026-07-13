import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { updateUserStripe, getDb } from "./db";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";

/**
 * Register the Stripe webhook route.
 * MUST be called BEFORE express.json() middleware is applied to the app,
 * because Stripe requires the raw request body for signature verification.
 */
export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured");
        return res.status(500).json({ error: "Webhook secret not configured" });
      }

      let event: Stripe.Event;

      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error("[Stripe Webhook] Signature verification failed:", err);
        return res.status(400).json({ error: "Webhook signature verification failed" });
      }

      // Handle test events (Stripe CLI test events start with evt_test_)
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Event: ${event.type} (${event.id})`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id
              ? parseInt(session.metadata.user_id, 10)
              : null;
            const customerId =
              typeof session.customer === "string" ? session.customer : null;
            const subscriptionId =
              typeof session.subscription === "string" ? session.subscription : null;

            if (userId && customerId) {
              await updateUserStripe(userId, {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId ?? undefined,
                subscriptionStatus: "active",
              });
              console.log(`[Stripe Webhook] User ${userId} subscription activated`);
            }
            break;
          }

          case "customer.subscription.updated":
          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId =
              typeof subscription.customer === "string" ? subscription.customer : null;

            if (customerId) {
              const db = await getDb();
              if (db) {
                const result = await db
                  .select({ id: users.id })
                  .from(users)
                  .where(eq(users.stripeCustomerId, customerId))
                  .limit(1);

                if (result.length > 0) {
                  await updateUserStripe(result[0].id, {
                    stripeSubscriptionId: subscription.id,
                    subscriptionStatus: subscription.status,
                  });
                  console.log(
                    `[Stripe Webhook] Subscription ${subscription.id} status: ${subscription.status}`
                  );
                }
              }
            }
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId =
              typeof invoice.customer === "string" ? invoice.customer : null;
            if (customerId) {
              const db = await getDb();
              if (db) {
                const result = await db
                  .select({ id: users.id })
                  .from(users)
                  .where(eq(users.stripeCustomerId, customerId))
                  .limit(1);
                if (result.length > 0) {
                  await updateUserStripe(result[0].id, { subscriptionStatus: "past_due" });
                }
              }
            }
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Stripe Webhook] Error processing event:", err);
        return res.status(500).json({ error: "Internal webhook processing error" });
      }

      return res.json({ received: true });
    }
  );
}
