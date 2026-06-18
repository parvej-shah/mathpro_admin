import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";

// ── SSO config ───────────────────────────────────────────────────────────────
// Auth is centralized on the student Frontend. The admin app has no login form;
// unauthenticated users are redirected to the Frontend login, which sends the
// token back via the URL `#token=` hash. The token cookie is shared across
// *.mathpro.academy so both apps read the same session.
const AUTH_COOKIE_DOMAIN = ".mathpro.academy";
const FRONTEND_AUTH_URL =
  process.env.NEXT_PUBLIC_FRONTEND_AUTH_URL || "https://www.mathpro.academy";

/** Build the Frontend login URL that returns here after authentication. */
export function getFrontendLoginUrl(returnTo?: string): string {
  const back =
    returnTo ||
    (typeof window !== "undefined" ? window.location.href : FRONTEND_AUTH_URL);
  return `${FRONTEND_AUTH_URL}/auth/login?redirect=${encodeURIComponent(back)}`;
}

function canUseCookieDomain(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return false;
  const bare = AUTH_COOKIE_DOMAIN.replace(/^\./, "");
  return host === bare || host.endsWith(`.${bare}`);
}

/** Persist the token to localStorage + the shared cross-subdomain cookie. */
export function persistToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  const secure = window.location?.protocol === "https:" ? "; secure" : "";
  const maxAge = 7 * 24 * 3600;
  if (canUseCookieDomain()) {
    document.cookie = `token=${encodeURIComponent(token)}; path=/; domain=${AUTH_COOKIE_DOMAIN}; max-age=${maxAge}; SameSite=Lax${secure}`;
  } else {
    document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  }
}

/**
 * On boot, capture a token handed over via the URL `#token=` hash (from the
 * Frontend login redirect), persist it, and strip it from the URL. Returns the
 * token if one was captured. Falls back to the shared cookie if no hash token.
 */
export function captureTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  const hash = window.location.hash?.slice(1);
  if (hash) {
    const token = new URLSearchParams(hash).get("token");
    if (token && checkTokenValidity(token)) {
      persistToken(token);
      // Strip the token from the URL so it doesn't linger in history.
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState({}, document.title, url.pathname + url.search);
      return token;
    }
  }

  // No hash token: adopt the shared cookie if present (set by the other app).
  const cookieMatch = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  if (cookieMatch) {
    const token = decodeURIComponent(cookieMatch[1]);
    if (checkTokenValidity(token)) {
      if (localStorage.getItem("token") !== token) {
        localStorage.setItem("token", token);
      }
      return token;
    }
  }

  return null;
}

/** JWT payload shape per JWT_TOKEN_SYSTEM_FRONTEND.md (managerial login) */
export interface DecodedToken {
  id?: number;
  name?: string;
  type?: number;
  exp?: number;
  login?: string;
  loginType?: string;
  email?: string;
  profile?: Record<string, unknown>;
  roles?: Array<{ id: number; name: string; display_name: string }>;
  permissions?: string[];
  createdAt?: number;
  [key: string]: unknown;
}

/**
 * Check if JWT token is valid
 */
export function checkTokenValidity(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    if (decoded.exp && decoded.exp < currentTime) {
      return false; // Token is expired
    }
    return decoded.name ? decoded.name.length > 0 : false;
  } catch {
    return false;
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  
  const token = localStorage.getItem("token");
  if (!token || !checkTokenValidity(token)) {
    return false;
  }
  return true;
}

/**
 * Logout: clear local + shared-cookie token and bounce to the Frontend login.
 */
export function logout(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  // Clear the shared cross-subdomain cookie (and any host-only fallback).
  document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${AUTH_COOKIE_DOMAIN};`;
  document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  const loginUrl = getFrontendLoginUrl(`${window.location.origin}/`);
  const sep = loginUrl.includes("?") ? "&" : "?";
  window.location.href = `${loginUrl}${sep}force_logout=1`;
}

/**
 * Get decoded token
 */
export function getDecodedToken(): DecodedToken | null {
  if (typeof window === "undefined") return null;
  
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
}

/**
 * Get user type from token
 */
export function getUserType(): number | null {
  const decoded = getDecodedToken();
  return decoded?.type ?? null;
}

/**
 * Encrypt string using AES encryption
 */
export function encryptString(text: string, secretKey: string): string {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

/**
 * Decrypt string using AES decryption
 */
export function decryptString(encryptedText: string, secretKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}
