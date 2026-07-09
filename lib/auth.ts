// Uses the Web Crypto API (globalThis.crypto) instead of Node's `crypto` module
// so this works in both the Edge Runtime (middleware) and the Node runtime (API routes).

const COOKIE_NAME = "admissions_auth";

function secret(): string {
  return process.env.COOKIE_SECRET || "dev-secret-change-me";
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Signs a simple token so the cookie can't be forged without knowing COOKIE_SECRET.
export async function makeToken(): Promise<string> {
  const payload = "ok";
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function isValidToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(payload);
  if (sig.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export { COOKIE_NAME };