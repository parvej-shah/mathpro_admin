import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";

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
 * Logout user and reload page
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem("token");
  window.location.href = "/login";
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
