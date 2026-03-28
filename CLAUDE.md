# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-page collaborative travel list app ("Lista de Viaje") built with vanilla HTML/CSS/JS and Supabase as the backend. No build tools, no npm dependencies — everything lives in `index.html`.

## Development

**Local dev:** Open `index.html` directly in a browser. There is no build step, no dev server, no compilation.

**Deploy to production:**
```bash
npm install -g surge  # one-time global install
surge . venezuela-gonzalez.surge.sh
```

`200.html` is a Surge.sh SPA routing fallback — it handles URL rewriting so hash routes load correctly.

## Architecture

All application code (markup, styles, logic) is in a single file: `index.html` (~520 lines).

**Two screens, toggled by show/hide:**
- `#home-screen` — create a new list or join one by 8-char code
- `#list-screen` — add/filter items, share link, real-time sync

**State** is managed in a plain JS object (`state`) holding the current list ID, user name, and items array.

**Database (Supabase/PostgreSQL):**
- `lists(id, name, created_at)` — list metadata
- `items(id, list_id, text, category, done, added_by, created_at)` — list items with categories: `task`, `goal`, `reminder`

**Real-time sync** uses Supabase `postgres_changes` subscription on the `items` table. Local inserts are deduplicated against incoming realtime events to avoid double-rendering.

**No authentication.** Access control relies on URL secrecy (the 8-char random list ID). Supabase RLS policies allow fully public read/write.

**Supabase credentials** are hardcoded in `index.html` (lines 231–232). The anon key is public and safe to expose; it is a `sb_publishable_*` key scoped to the project's RLS policies.

**Username** is persisted in `localStorage` so users don't re-enter it on reload.

## Database

`seed.sql` contains the full schema to initialize a new Supabase project. Run it in the Supabase SQL editor if setting up a fresh instance.

## Language

The entire UI is in Spanish (es-VE).
