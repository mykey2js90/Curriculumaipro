import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Decode the OAuth state parameter.
 *
 * The frontend encodes state in one of two shapes:
 *   - btoa(redirectUri)                                — no returnPath
 *   - btoa(JSON.stringify({ redirectUri, returnPath })) — with returnPath
 *
 * Both are handled here. Returns { redirectUri, returnPath? }.
 */
function decodeState(state: string): { redirectUri: string; returnPath?: string } {
  const decoded = atob(state);
  try {
    const parsed = JSON.parse(decoded) as { redirectUri: string; returnPath?: string };
    if (parsed && typeof parsed.redirectUri === "string") {
      return { redirectUri: parsed.redirectUri, returnPath: parsed.returnPath };
    }
  } catch {
    // Not JSON — treat the decoded value as a plain redirectUri string.
  }
  return { redirectUri: decoded };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const { redirectUri, returnPath } = decodeState(state);

      const tokenResponse = await sdk.exchangeCodeForToken(code, redirectUri);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to the returnPath if provided, otherwise go to the homepage.
      res.redirect(302, returnPath && returnPath.startsWith("/") ? returnPath : "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
