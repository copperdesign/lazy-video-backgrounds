# Contributing

Thanks for the interest. This is a small, focused browser module — contributions
that make it sharper, less surprising, or more useful for the next person
dropping a video playlist into a hero section are welcome.

## Ownership and merging

I (@copperdesign) maintain the repo and merge all PRs. You're welcome to
fork, branch, and propose changes — I'll review on my own timeline. No CLA.

## What fits

Yes:

- Bug fixes with a clear repro (a minimal HTML page that reproduces the
  glitch is the gold standard)
- Edge cases in playback chaining you hit on a real site (codec quirks,
  autoplay-policy interactions, mobile Safari oddities)
- Sharper readiness heuristics — places where the current `readyState` +
  event listener combination misses or double-fires
- Doc clarifications — especially the WHY of a behavior that confused you
- Quality-of-life additions to existing options that don't widen the API
  surface

Probably no — open an issue first to discuss:

- New top-level options on the `options` object
- Adding runtime dependencies (the module is intentionally zero-deps; the
  contract is one file, browser APIs only)
- Restructuring `index.js` into multiple files
- Framework-specific wrappers (React, Vue, etc.) — these belong in
  separate packages that depend on this one

Hard no:

- Adding a build step, bundler, or transpile pipeline. The module ships
  as plain ES module source.
- Telemetry, analytics, "phone home" of any kind.
- Auto-generated boilerplate PRs (license bumps from bots, dependency
  pings against non-existent deps, mass formatting reflows).
- Polyfills for browsers that don't support `IntersectionObserver` —
  it's the floor we target.

## Getting set up

```bash
git clone https://github.com/copperdesign/lazy-video-backgrounds.git
cd lazy-video-backgrounds
```

No `npm install` — there are no dependencies, runtime or dev. Open
`example.html` directly in a browser to exercise the module against a
real playlist.

```bash
# any static server will do — pick your favorite
python3 -m http.server 8000
# then visit http://localhost:8000/example.html
```

(File-protocol won't work — ES modules require `http(s)://`.)

## PR workflow

1. Fork and branch off `main`. Branch names are free-form.
2. Keep PRs scoped. One concern per PR; bundle small drive-by cleanups
   into the same diff if they're in the file you're touching, otherwise
   open a separate PR.
3. Write commit messages that explain *why*, not what. Mirror the style
   already in `git log` — short prefix, present-tense subject, body when
   it earns its place.
4. In the PR description: what changed, why, and how you tested. A short
   screen recording for anything visible (sequencing, fade behavior,
   offscreen pausing) saves a lot of back-and-forth.
5. Open the PR against `main`.

## Code style

The module is a single plain ES module targeting evergreen browsers
(anything that ships `IntersectionObserver`). No transpile, no bundle.

- **Zero runtime deps.** Browser APIs only. If you need a helper, write
  it inline.
- **One file.** `index.js` is the whole module. Don't split it up.
- **Comment liberally.** Inline comments explain WHY. Browser quirks,
  event-ordering races, the reason a `readyState` check is needed *and*
  an event listener — write the reasoning down. Don't narrate the
  obvious line below.
- **Long, descriptive names** over short clever ones. `playNextWhenReady`
  beats `pnwr`.
- **`async`/`await` over callbacks or stray `.then()` chains.**
- **Idempotent teardown.** Calling the returned `teardown()` twice
  should be safe and silent.
- **Preserve the file header.** The top `/*! ... */` banner is the
  license notice that survives minification — leave it intact.

## Testing

There's no test suite — the module is exercised against `example.html`
and real sites. Before opening a PR:

1. Open `example.html` in a fresh browser and confirm the playlist
   sequences cleanly, loops the active clip when the next isn't ready,
   and pauses when you scroll the container out of view.
2. Test in at least one non-Chromium browser (Safari or Firefox). Mobile
   Safari catches the most autoplay-policy edge cases — if you can,
   spot-check it.
3. Confirm `teardown()` actually removes listeners — the easiest check
   is to call it and verify that `ended`-driven progression stops.

Note what you tested in the PR description, including browser + OS.

## Reporting bugs

Open an issue with:

- A minimal HTML page that reproduces it (a Gist or CodePen is fine)
- The browser + OS where it reproduces
- What you expected vs. what happened
- The version (from `package.json` or your `npm ls` output)

A short screen recording is worth a thousand words for anything visual.

## Asking questions

Issues are fine for questions too — tag them `question`. Don't email me
directly with usage questions; an issue helps the next person.
