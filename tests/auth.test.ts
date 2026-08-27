import { describe, expect, it, vi } from "vitest"
import { sanitizeRedirectUrl } from "../lib/auth/redirect"
import { translations } from "../lib/i18n/dictionary"
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "../lib/supabase/client"
import { generateEditToken, hashEditToken } from "../lib/groups/crypto"

describe("Google Authentication Only & Security Invariants", () => {
  describe("Redirect URL Sanitization (Open-Redirect Prevention)", () => {
    it("allows safe internal relative paths", () => {
      expect(sanitizeRedirectUrl("/")).toBe("/")
      expect(
        sanitizeRedirectUrl("/g/3fa85f64-5717-4562-b3fc-2c963f66afa6")
      ).toBe("/g/3fa85f64-5717-4562-b3fc-2c963f66afa6")
      expect(
        sanitizeRedirectUrl(
          "/g/3fa85f64-5717-4562-b3fc-2c963f66afa6/member/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
        )
      ).toBe(
        "/g/3fa85f64-5717-4562-b3fc-2c963f66afa6/member/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
      )
      expect(sanitizeRedirectUrl("/#features")).toBe("/#features")
    })

    it("rejects protocol-relative and external domain URLs", () => {
      expect(sanitizeRedirectUrl("//evil.com")).toBe("/")
      expect(sanitizeRedirectUrl("//attacker.org/phish")).toBe("/")
      expect(sanitizeRedirectUrl("https://evil.com")).toBe("/")
      expect(sanitizeRedirectUrl("http://attacker.org")).toBe("/")
      expect(sanitizeRedirectUrl("ftp://files.org")).toBe("/")
    })

    it("rejects javascript: and pseudo-protocol injection attacks", () => {
      expect(sanitizeRedirectUrl("javascript:alert(document.cookie)")).toBe("/")
      expect(sanitizeRedirectUrl("data:text/html;base64,...")).toBe("/")
      expect(sanitizeRedirectUrl("/\\evil.com")).toBe("/")
      expect(sanitizeRedirectUrl("/%5Cevil.com")).toBe("/")
      expect(sanitizeRedirectUrl("/%2F%2Fevil.com")).toBe("/")
    })

    it("prevents redirect loops back to auth routes", () => {
      expect(sanitizeRedirectUrl("/login")).toBe("/")
      expect(sanitizeRedirectUrl("/login?next=/somewhere")).toBe("/")
      expect(sanitizeRedirectUrl("/auth/callback")).toBe("/")
    })

    it("falls back to '/' on null, undefined, or empty inputs", () => {
      expect(sanitizeRedirectUrl(null)).toBe("/")
      expect(sanitizeRedirectUrl(undefined)).toBe("/")
      expect(sanitizeRedirectUrl("")).toBe("/")
      expect(sanitizeRedirectUrl("   ")).toBe("/")
    })
  })

  describe("Bilingual Auth Translations & Copy Requirements", () => {
    it("contains exact required Arabic copy", () => {
      const ar = translations.ar
      expect(ar.authContinueWithGoogle).toBe("المتابعة باستخدام Google")
      expect(ar.authSecureGoogle).toBe("تسجيل الدخول آمن عبر Google")
      expect(ar.authLoginTitle).toBe("نظّم ورد القرآن بسهولة")
      expect(ar.authLoginSubtitle).toBe(
        "اجمع عائلتك أو مجموعتك وأنشئ جدول ورد واضحًا للجميع."
      )
      expect(ar.authSignIn).toBe("تسجيل الدخول")
      expect(ar.authSignOut).toBe("تسجيل الخروج")
      expect(ar.authConnectingGoogle).toContain("Google")
      expect(ar.authTryAgain).toBeTruthy()
    })

    it("contains exact required English copy", () => {
      const en = translations.en
      expect(en.authContinueWithGoogle).toBe("Continue with Google")
      expect(en.authSecureGoogle).toBe("Secure sign in with Google")
      expect(en.authLoginTitle).toBe("Organize your Quran reading with ease")
      expect(en.authLoginSubtitle).toBe(
        "Create a clear reading schedule for your family or group."
      )
      expect(en.authSignIn).toBe("Sign In")
      expect(en.authSignOut).toBe("Sign Out")
      expect(en.authConnectingGoogle).toContain("Google")
      expect(en.authTryAgain).toBeTruthy()
    })
  })

  describe("Supabase Browser Client Auth Setup", () => {
    it("exports isSupabaseConfigured and getSupabaseBrowserClient functions", () => {
      expect(typeof isSupabaseConfigured).toBe("function")
      expect(typeof getSupabaseBrowserClient).toBe("function")
    })
  })

  describe("Public Schedule & Edit Link Invariants (Regression Checks)", () => {
    it("preserves account-free cryptographic edit key generation and hashing", () => {
      const key = generateEditToken()
      expect(key).toBeTruthy()
      expect(key.length).toBe(64) // 32 bytes = 64 hex chars

      const hash = hashEditToken(key)
      expect(hash).toBeTruthy()
      expect(hash.length).toBe(64) // SHA-256 = 64 hex chars

      // Hashes must be deterministic
      expect(hashEditToken(key)).toBe(hash)
    })
  })
})
