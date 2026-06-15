# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file, zero-dependency browser ES module published as `@copperdesign/lazy-video-backgrounds`. The entire module is `index.js` (~130 lines). There is no build step, no bundler, no transpile, no `npm install` (no deps, runtime or dev).

## Running and testing

There is no test suite and no dev server config. The module is exercised against `example.html` in a real browser:

```sh
python3 -m http.server 8000
# visit http://localhost:8000/example.html
```

The `clips/` directory referenced by `example.html` is gitignored — drop a few short `.mp4` files in there to exercise sequencing locally.

File-protocol won't work (ES modules require `http(s)://`).

CI (`.github/workflows/ci.yml`) does only smoke checks: `node --check index.js`, validates `package.json`, confirms the `exports` map points at a real file, and asserts the `/*! ... */` license banner on line 1 is intact. Run any of these locally if you suspect breakage.

## Architecture — the non-obvious parts

The naive "swap video on `ended`" approach has two failure modes that drive almost every design choice in `index.js`. Understanding them is the difference between editing this file safely and breaking the core invariant.

1. **`preload="auto"` is advisory; non-playing videos sit at `readyState 0`.** Browsers typically only buffer the *playing* clip. Waiting for `canplaythrough` on videos 2..N loops forever unless something kicks them.
2. **`canplaythrough` is fire-and-forget.** With small clips and `preload="auto"`, it can fire before the listener attaches — gone by the time the handler runs.

The module handles both by:

- **Seeding readiness from both directions.** `video.canplaythru` is set from `readyState >= 4` AT init (catches the already-fired case) AND updated by the `canplaythrough` listener (keeps it accurate as buffering progresses). Don't replace one with the other — the race needs both.
- **Actively triggering `next.load()` when the current clip starts playing** (in `onPlay`), and again in `onEnded` if next still isn't ready. This is what defeats the `readyState 0` trap.
- **Looping the current clip on `ended` when next isn't ready** (rewind + replay) instead of stalling. A later `ended` iteration takes over once `next.canplaythru` flips true. This is the "no black frame" guarantee.

`IntersectionObserver` on the root handles pause-when-offscreen. It targets the active video by querying for `.${cls.playing}, .${cls.paused}` — those CSS class names are not just hooks for the host site's styling, they're how the module re-finds the active element after scroll changes. Renaming `classNames.playing`/`paused` via options is fine; just know the observer relies on the same names.

The returned `teardown()` must remove every listener and disconnect the observer — it's contractually idempotent-safe and used by SPA hosts. Any new listener added inside the main `forEach` needs a matching push to `teardowns`.

## Conventions that matter here

- **One file, zero deps, no build step.** These three constraints are load-bearing (see `CONTRIBUTING.md`'s "Hard no" list). Don't split `index.js`, don't introduce a bundler, don't add a runtime dep.
- **Preserve the `/*! ... */` header on line 1 of `index.js`.** It's the license notice that survives minification, and CI asserts it.
- **Comment WHY, not what.** The existing comments document browser quirks (preload behavior, event-ordering races, why both `readyState` and the event are needed). Match that register — don't narrate the next line, do explain hidden constraints.
- **Long descriptive names over clever short ones.** `playNextWhenReady` over `pnwr`.
- **`IntersectionObserver` is the floor.** No polyfills for browsers without it.

## Release flow

The repo is master-first; commits go straight to `main`. Releases are tag-triggered:

```sh
npm version patch        # bumps package.json, commits, tags vX.Y.Z
git push --follow-tags
gh release create vX.Y.Z --generate-notes
```

`.github/workflows/release.yml` publishes to npm with provenance from the tag. Requires `NPM_TOKEN` repo secret.
