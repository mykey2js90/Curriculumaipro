export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Pass an optional returnPath (e.g. "/generate") to redirect there after login.
export const getLoginUrl = (returnPath?: string): string => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;

  if (!oauthPortalUrl || !appId) {
    console.error(
      "[Auth] Cannot build login URL: VITE_OAUTH_PORTAL_URL and/or VITE_APP_ID " +
      "are not set. Add these environment variables in your Vercel project settings "
      + "(Settings → Environment Variables) and redeploy."
    );
    // Return a path that shows the user something went wrong rather than
    // silently reloading the page.
    return "/login-error";
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const statePayload = returnPath
    ? btoa(JSON.stringify({ redirectUri, returnPath }))
    : btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", statePayload);
  url.searchParams.set("type", "signIn");
  return url.toString();
};
