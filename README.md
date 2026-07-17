# ✦ Prayer Journal

A simple, private prayer app — **Story Cards & Guided Prayer**, based on *Practicing The Way: Prayer*.

**Live app: [prayer-card.netlify.app](https://prayer-card.netlify.app)**

Prayer Journal is an offline-first Progressive Web App (PWA) for a daily and weekly prayer rhythm. There are no accounts, no servers, and no tracking — everything you write stays in your browser, on your device. The entire app ships as a single `index.html` file.

---

## Features

The app is organised around three prayer rhythms plus reflection and a guide, reachable from the bottom navigation:

- **🃏 Story Cards** — Track prayers as ongoing stories (from Paul Miller's *A Praying Life*). Each card holds a person or situation, a category, a Scripture anchor, a two-level "ask" (a heart-level change and a desired circumstance), and a "Father's Perspective" line. Add dated story notes over time, mark cards answered, and pray through them one at a time in a walkthrough.
- **☀️ Daily Prayer** — Three guided plans that share an *Approach → Bible meditation → Prayer → Contemplation* shape:
  - **Morning** (~25 min), **Evening** (~15 min), **Starter** (~15 min).
  - Scriptural invocations, meditation questions and techniques, written-prayer library, and a "pray your story cards" shortcut.
- **✍️ Weekly Deep Time** — A once-a-week deeper practice (Sunday recommended). Begins with a *Preparing to Pray* reflection, then walks the Lord's Prayer in six steps — **Come · Humble · Ask · Repent · Forgive · Follow** — each with a *Pray* prompt and a *Listen* prompt.
- **🪞 Reflect** — Stats and streaks, a year-at-a-glance heatmap, answered prayers, heart-need and word-frequency views, a weekly review of story cards, plus settings (theme, text size), Markdown export, and backup/restore.
- **✦ Guide** — A short tutorial, an overview of the three rhythms, install instructions, credits, and privacy details.

Supporting touches throughout: a 9-need **Needs of the Heart** chart, a 3-level **emotion wheel** for naming feelings, "cry out" / praise / thanksgiving prompt chips, an embedded **Prayer Library** of ~40 Scripture-saturated written prayers (from Matthew Henry's method), light/dark/auto themes, adjustable text size, and a swipe-friendly mobile UI with autosaving drafts.

---

## Privacy

Your data is **local-only**:

- **No accounts.** No sign-up, login, or email.
- **No servers.** Your prayers, story cards, and reflections never leave your device.
- **No tracking.** No analytics, telemetry, or tracking cookies.
- **No third parties.** No fonts or scripts loaded from CDNs — the whole app is one file.

Because everything lives in your browser's local storage:

- Clearing your browser cache or site data will erase everything — use **💾 Backup & Restore** (in the Reflect tab) regularly.
- Moving to a new device means exporting a backup and importing it on the other end.
- The service worker caches only the app files (HTML, icon, manifest). It does not collect or transmit anything you write.

---

## Install on your phone

Prayer Journal is a PWA, so you can add it to your home screen and use it offline:

1. Open **[prayer-card.netlify.app](https://prayer-card.netlify.app)** in your phone's browser.
2. **iOS (Safari):** tap the Share button → **Add to Home Screen**.
3. **Android (Chrome):** tap the **⋮** menu → **Install app** / **Add to Home Screen**.

It then launches full-screen like a native app and works without a connection.

---

## Running locally

The app is plain static files — no build step and no dependencies. Because service workers only register over `https` or `localhost`, serve the folder rather than opening the file directly (opening `index.html` from `file://` works for most features, but the service worker / offline caching will be skipped).

```bash
# from the project root, pick whichever you have:
python3 -m http.server 8000
# or
npx serve .
```

Then visit `http://localhost:8000`.

---

## Deploying

Any static host works — just serve the files over `https` so the PWA and service worker function. There is no build step; deploy the repository root as-is.

- **Netlify / Vercel:** point the project at this repo with no build command and the root as the publish directory. (The live app is hosted on Netlify.)
- **GitHub Pages:** enable Pages for the repository and serve from the root.
- **Any web server:** copy `index.html`, `manifest.json`, `sw.js`, and the two `icon*.svg` files to the served directory.

When you change the cached app shell and want all clients to refresh it, bump `CACHE_NAME` in `sw.js`.

---

## Project layout

| File | Purpose |
|------|---------|
| `index.html` | The entire app — HTML, CSS, and JavaScript inline (markup, styles, and ~4,000+ lines of vanilla JS). |
| `sw.js` | Service worker. Network-first for HTML/navigation (so updates ship), cache-first for other assets. |
| `manifest.json` | PWA manifest (standalone display, portrait, theme colours). |
| `icon.svg`, `icon-maskable.svg` | App icons. |

---

## For contributors

The app is intentionally framework-free — vanilla JavaScript with no build tooling. To make sense of `index.html`:

- **`<head>` script (top):** applies the saved theme and text size synchronously before first paint to avoid a flash.
- **`<style>` block:** all CSS, including theme variables driven by `data-theme` / `data-text-size` attributes on `<html>`.
- **`<body>`:** the five `view` containers, the bottom `<nav>`, the floating action button, and a set of `modal-bg` bottom-sheet modals.
- **Main `<script>`:** the bulk of the app, organised roughly as:
  - **Content data** — large constants such as `PL_STEPS` (Weekly Deep Time), `DP_PLANS` (the three daily plans), `HEART_NEEDS`, `EMOTION_WHEEL`, `PRAYER_LIBRARY`, `SCRIPTURE_TEXTS`, `SCRIPTURAL_INVOCATIONS`, `MEDITATION_QUESTIONS`/`MEDITATION_TECHNIQUES`, and the prompt-chip lists.
  - **Data helpers** — `loadCards`/`saveCards`, session and draft load/save, all routed through `safeSetItem` / `storageAvailable` so the app degrades gracefully when storage is blocked.
  - **Render functions** — each view and modal renders by writing `innerHTML` into its container (e.g. `renderCards`, `renderDailyPrayer`, `renderPL`, the Reflect renderers).
  - **Interaction** — swipe navigation (`setupSwipeFor`), swipe-to-dismiss bottom sheets, debounced autosave, and a `beforeunload` flush of in-progress sessions.

**Conventions:** match the surrounding style (the file uses compact, single-purpose functions and inline `onclick` handlers). User text is escaped via `esc()` before insertion. Keep everything self-contained in the single file — no external fonts, scripts, or network calls.

### Data model

State is stored in `localStorage` under keys including:

- `prayer_cards` — story cards (with their notes, links, and answered status).
- `pl_sessions` / `pl_draft` — Weekly Deep Time sessions and the in-progress draft.
- `daily_sessions` / `daily_draft` — Daily Prayer sessions and draft.
- `streak_days`, `theme`, `text_size`, and Obsidian export preferences.

The **Reflect → Backup & Restore** export bundles all of this into a single JSON file; import merges it back in. Markdown export produces Obsidian-friendly files (YAML frontmatter and `[[wikilinks]]`).

---

## License & content

The **code** is released under the [MIT License](LICENSE) — free to use, modify, and distribute.

The **spiritual and devotional content is not original** and is **not** covered by that license. It is adapted directly from copyrighted study material and books. If you'd like to share this app or use the content beyond personal practice, please **seek permission from Redemption Hill Church** and credit the authors below.

### Credits & source material

- **Redemption Hill Church** — *Practicing The Way: Prayer* study guide. The Lord's Prayer flow (Come · Humble · Ask · Repent · Forgive · Follow), the Preparing-to-Pray reflection, the Needs of the Heart chart, and most prompts come directly from this guide.
- **Paul Miller** — *A Praying Life*. The Prayer Story Cards practice (Scripture anchor, two-level ask, Father's Perspective) is built on his work.
- **Tim Keller** — *Prayer: Experiencing Awe and Intimacy with God*. The Daily Prayer practice (the three plan options and the Approach → Meditation → Prayer → Contemplation shape) is drawn from Ch. 15, with several meditation and praise-deepening features from Chapters 10–12.
- **Matthew Henry** — *A Way to Pray: A Biblical Method for Enriching Your Prayer Life*. The 📖 Prayer Library — roughly forty written prayers across Praise, Confession, Petition, Thanksgiving, and Concluding — is drawn from his method.
- **English Standard Version (ESV)** — Scripture quotations, the 📖 Bible browser, and the Scripture-lookup text are from *The Holy Bible, English Standard Version® (ESV®)*, copyright © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.

This app is a personal tool, offered freely for personal prayer.
