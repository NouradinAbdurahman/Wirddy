import { describe, expect, it } from "vitest"
import fs from "fs"
import path from "path"

describe("Progressive Web App (PWA) Implementation", () => {
  const publicDir = path.resolve(process.cwd(), "public")

  it("verifies manifest.webmanifest exists and has all required PWA fields", () => {
    const manifestPath = path.join(publicDir, "manifest.webmanifest")
    expect(fs.existsSync(manifestPath)).toBe(true)

    const raw = fs.readFileSync(manifestPath, "utf-8")
    const manifest = JSON.parse(raw)

    expect(manifest.name).toContain("Wirddy")
    expect(manifest.short_name).toContain("Wirddy")
    expect(manifest.start_url).toBe("/")
    expect(manifest.display).toBe("standalone")
    expect(manifest.background_color).toBe("#020617")
    expect(manifest.theme_color).toBe("#020617")
    expect(manifest.dir).toBe("rtl")
    expect(manifest.lang).toBe("ar")
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4)

    // Verify each icon referenced in the manifest physically exists in the public directory
    for (const icon of manifest.icons) {
      const iconPath = path.join(publicDir, icon.src.replace(/^\//, ""))
      expect(fs.existsSync(iconPath), `Missing icon file: ${icon.src}`).toBe(
        true
      )
    }
  })

  it("verifies public/sw.js exists and implements offline service worker lifecycle", () => {
    const swPath = path.join(publicDir, "sw.js")
    expect(fs.existsSync(swPath)).toBe(true)

    const swContent = fs.readFileSync(swPath, "utf-8")
    expect(swContent).toContain("CACHE_NAME")
    expect(swContent).toContain("addEventListener('install'")
    expect(swContent).toContain("addEventListener('activate'")
    expect(swContent).toContain("addEventListener('fetch'")
    expect(swContent).toContain("skipWaiting()")
    expect(swContent).toContain("clients.claim()")
  })

  it("verifies PWA icons exist in public directory", () => {
    const requiredIcons = [
      "wirddy-icon-black.png",
      "wirddy-icon-white.png",
      "icon-192.png",
      "icon-512.png",
      "apple-touch-icon.png",
      "icon.svg",
    ]

    for (const iconFile of requiredIcons) {
      const fullPath = path.join(publicDir, iconFile)
      expect(fs.existsSync(fullPath), `Icon not found: ${iconFile}`).toBe(true)
    }
  })

  it("verifies add-to-home-screen.gif exists in public directory", () => {
    const gifPath = path.join(publicDir, "add-to-home-screen.gif")
    expect(
      fs.existsSync(gifPath),
      "add-to-home-screen.gif not found in public directory"
    ).toBe(true)
    const stats = fs.statSync(gifPath)
    expect(stats.size).toBeGreaterThan(1000)
  })
})
