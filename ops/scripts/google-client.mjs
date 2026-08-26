import fs from "node:fs";
import path from "node:path";
import { GoogleAuth } from "google-auth-library";
import { repoRoot } from "./ops-core.mjs";

export function resolveGoogleCredential(env = process.env) {
  const configured = env.GOOGLE_APPLICATION_CREDENTIALS;
  const fallback = path.join(repoRoot, ".secrets", "google-service-account.json");
  const credentialPath = configured || fallback;
  return fs.existsSync(credentialPath) ? credentialPath : null;
}

export function googleApiAvailability({ env = process.env, requireGaProperty = false } = {}) {
  const credentialPath = resolveGoogleCredential(env);
  const gscSiteUrl = env.GSC_SITE_URL || "sc-domain:steal2eggs.wiki";
  const ga4PropertyId = env.GA4_PROPERTY_ID || null;
  const configured = Boolean(credentialPath && (!requireGaProperty || ga4PropertyId));
  return { configured, credentialPath, gscSiteUrl, ga4PropertyId };
}

export async function googleRequest({ credentialPath, scopes, url, data }) {
  const auth = new GoogleAuth({ keyFile: credentialPath, scopes });
  const client = await auth.getClient();
  const response = await client.request({ url, method: "POST", data });
  return response.data;
}
