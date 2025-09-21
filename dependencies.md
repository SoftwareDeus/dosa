# 📦 Projekt: useit – Dependency Übersicht

Dieses Dokument beschreibt die wichtigsten Dependencies und warum sie im Projekt benötigt werden.  
Stand: aktuell zu `package.json`.

---

## 🚀 Framework & Build

- **svelte (^5.39.3)**  
  → Frontend-Framework (Komponenten, Reaktivität).
- **@sveltejs/kit (^2.42.2)**  
  → Meta-Framework für Routing, SSR, APIs, etc.
- **vite (^7.1.6)**  
  → Dev-Server & Bundler (schnelle Entwicklung, Optimierung beim Build).
- **@sveltejs/vite-plugin-svelte**  
  → Vite-Plugin, damit Vite Svelte versteht.
- **@sveltejs/adapter-static**  
  → Build für statische Seiten (z. B. PWA).
- **@sveltejs/adapter-vercel**  
  → Deployment-Adapter für Vercel.
- **@sveltejs/app-utils**  
  → Experimentelle Utilities für SvelteKit (nur falls gebraucht).

---

## 🎨 Styling & UI

- **tailwindcss (^4.1.13)**  
  → Utility-First CSS-Framework.
- **@tailwindcss/forms / typography / vite**  
  → Plugins für bessere Formulare, Texte und Vite-Integration.
- **autoprefixer, postcss**  
  → Automatische CSS-Vendor-Prefixes, PostCSS-Pipeline.

---

## 📱 Mobile (Capacitor)

- **@capacitor/core, @capacitor/cli, @capacitor/android, @capacitor/ios**  
  → Basis für native iOS/Android-Apps.
- **@capacitor/app, device, filesystem, geolocation, haptics, keyboard, network, preferences, push-notifications, status-bar, local-notifications**  
  → Native APIs (Gerätestatus, Push, Filesystem, etc.).
- **@aparajita/capacitor-secure-storage**  
  → Sichere Speicherung von Tokens/Secrets.
- **@capgo/capacitor-social-login**  
  → Native Google/Apple Login-Flows.

---

## 🗄️ Datenbank & ORM

- **prisma & @prisma/client (6.16.2)**  
  → Type-Safe ORM für PostgreSQL.
- **postgres (^3.4.5)**  
  → Low-Level PostgreSQL-Client (direkt).
- **zod (^4.1.11)**  
  → Schema-Validation (Inputs, API-Requests).

---

## 🔑 Auth & Security

- **@supabase/supabase-js (^2.57.4)**  
  → Supabase JS SDK (Auth, DB, Storage).
- **@supabase/ssr (^0.7.0)**  
  → SSR-Integration mit Cookie-Handling.
- **jose (^6.1.0)**  
  → JWT-Handling & Crypto.
- **@node-rs/argon2 (^2.0.2)**  
  → Sichere Passwort-Hashing-Algorithmen.

---

## 🐞 Monitoring & Logging

- **@sentry/sveltekit (^10.12.0)**  
  → Error/Performance-Monitoring für Web.
- **@sentry/capacitor (^2.3.1)**  
  → Error/Crash-Reporting für Mobile.
- **@sentry/cli (^2.54.0)**  
  → CLI für Release-Management und Sourcemaps.

---

## 🧪 Testing & QA

- **vitest, @vitest/browser, vitest-browser-svelte**  
  → Unit-Tests & Browser-Tests für Svelte.
- **playwright, @playwright/test**  
  → End-to-End Tests (Cross-Browser).
- **storybook, @storybook/sveltekit, addons**  
  → UI-Komponenten isoliert entwickeln & testen.
- **@chromatic-com/storybook**  
  → Visuelle Regressionstests (Storybook in der Cloud).

---

## 🔧 Developer Experience

- **typescript (^5.0.0)**  
  → Type-Safe Entwicklung.
- **svelte-check**  
  → Typechecking für Svelte-Dateien.
- **eslint, eslint-plugin-svelte, eslint-plugin-storybook, eslint-config-prettier**  
  → Linting-Regeln für sauberen Code.
- **prettier, prettier-plugin-svelte, prettier-plugin-tailwindcss**  
  → Code-Formatter.
- **globals**  
  → Typings für globale Variablen.

---

## 🛠️ Utilities

- **workbox-window**  
  → PWA-Features & Service Worker Handling.
- **vite-plugin-pwa**  
  → PWA-Support direkt im Vite-Build.
- **vite-plugin-devtools-json**  
  → Einfaches Arbeiten mit JSON während der Dev-Phase.
- **@inlang/paraglide-js**  
  → i18n (Internationalisierung).
- **@oslojs/crypto, @oslojs/encoding**  
  → Krypto-/Encoding-Helfer.

---

## 🔍 Scripts Überblick

- **dev** → `vite dev` → Startet lokalen Dev-Server.
- **build** → `svelte-kit build` → Baut App (Web).
- **build:mobile** → `svelte-kit build && npx cap sync` → Baut + synced Capacitor.
- **dev:ios / dev:android** → Startet iOS/Android App.
- **preview** → Testet gebaute Version.
- **storybook** → Startet Storybook (UI-Doku).
- **test / test:e2e / test:unit** → Test-Läufe.
- **prisma:generate / migrate / deploy** → Prisma DB-Management.
- **sentry:release** → Automatisches Sentry-Release inkl. Sourcemaps.

---
