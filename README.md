# @copperdesign/lazy-video-backgrounds

[![npm version](https://img.shields.io/npm/v/@copperdesign/lazy-video-backgrounds.svg)](https://www.npmjs.com/package/@copperdesign/lazy-video-backgrounds)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@copperdesign/lazy-video-backgrounds)](https://bundlephobia.com/package/@copperdesign/lazy-video-backgrounds)
[![license](https://img.shields.io/npm/l/@copperdesign/lazy-video-backgrounds.svg)](./LICENSE)

Sequentially-looping background-video playlist with progressive lazy loading and pause-when-offscreen.

Drop a row of `<video>` elements into a container, point this at the container, and they'll play one at a time, loop the current one while the next buffers, and pause automatically when you scroll away. No framework. No build step. ~1 KB minified.

```html
<div id="hero">
  <video preload="auto" muted playsinline>
    <source src="clip-1.mp4" type="video/mp4">
  </video>
  <video preload="auto" muted playsinline>
    <source src="clip-2.mp4" type="video/mp4">
  </video>
  <video preload="auto" muted playsinline>
    <source src="clip-3.mp4" type="video/mp4">
  </video>
</div>

<script type="module">
  import lazyVideoBackgrounds from '@copperdesign/lazy-video-backgrounds';
  lazyVideoBackgrounds(document.getElementById('hero'));
</script>
```

That's the whole API.

## What it does

- **Plays one clip at a time.** Children of the root are taken in DOM order.
- **Lazy-loads the rest.** Browsers usually only buffer the *playing* video. When one starts, the next one's `load()` is kicked, so by the time the current finishes, the next is ready.
- **Loops the current while next is still buffering.** No black-frame stalls. Once the next is ready, it takes over on the following `ended`.
- **Pauses when offscreen.** An `IntersectionObserver` on the root pauses the active video when it scrolls out of view and resumes when it scrolls back in.
- **Tags state in CSS.** The currently-active video gets `.is-playing` or `.is-paused` — use these in your own styles for fades, overlays, etc.

## Install

```sh
npm install @copperdesign/lazy-video-backgrounds
```

Or vendor [`index.js`](./index.js) directly — it's a single file with no dependencies.

## API

```js
import lazyVideoBackgrounds from '@copperdesign/lazy-video-backgrounds';

const teardown = lazyVideoBackgrounds(root, options);
```

### `root`

The container element. Its direct `<video>` children are the playlist. Non-video children are ignored, so you can sprinkle in overlays, captions, etc.

### `options`

| Option | Default | Description |
|---|---|---|
| `autoplay` | `true` | Pick a starting clip and play it on init. Set `false` to take over playback control yourself. |
| `random` | `true` | Starting clip is random. Set `false` to start at the first child. |
| `pauseWhenOffscreen` | `true` | Pause the active video when the root scrolls out of the viewport. |
| `classNames.playing` | `'is-playing'` | Class added to the active, playing video. |
| `classNames.paused` | `'is-paused'` | Class added to the active, paused video. |

### Return value

A `teardown()` function. Call it to remove every event listener and disconnect the observer — useful in SPAs when the host element is unmounted.

```js
const teardown = lazyVideoBackgrounds(root);
// ...later
teardown();
```

## Markup recommendations

- Use `preload="auto"` on every video. It's a hint browsers may ignore, but you give the lazy-load logic the best chance of finding things already-warm.
- Use `muted` and `playsinline` — without them, mobile and autoplay policies will reject `play()`.
- Don't put `loop` on the videos. The script chains them on `ended`; `loop` would prevent that event from firing.

```html
<video preload="auto" muted playsinline>
  <source src="clip.mp4" type="video/mp4">
  <source src="clip.webm" type="video/webm">
</video>
```

## CSS hooks

The currently active video carries `.is-playing` or `.is-paused`. Stack the videos absolutely, default them to `opacity: 0`, and fade in the playing one:

```css
#hero { position: relative; }
#hero video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 200ms ease-out;
}
#hero video.is-playing { opacity: 1; }
```

## Why this exists

A common hero pattern: several short clips that play back-to-back as a moving background. The naive implementation — five `<video>` tags with `preload="auto"` and a sequencer that swaps them on `ended` — falls into two traps:

1. **Browsers don't actually preload non-playing videos.** `preload="auto"` is advisory. In practice only the playing video buffers; the others stay at `readyState 0`. The naive sequencer waits for `canplaythrough` on the next clip and waits forever.
2. **`canplaythrough` is a fire-and-forget event.** If it fires before your handler attaches (a real race with small clips), you'll never observe it.

This module fixes both: it seeds readiness from `readyState` *and* listens for the event, and it actively triggers `next.load()` when the current clip starts playing.

## Contributing

PRs and issues welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup,
the PR workflow, and what fits the scope of the module. The repo follows
the [Contributor Covenant](CODE_OF_CONDUCT.md).

Quick version: fork, branch off `main`, exercise your change against
`example.html` in at least one non-Chromium browser, open a PR. I
(@copperdesign) review and merge.

## Releasing (maintainer notes)

The package is published to npm as
[`@copperdesign/lazy-video-backgrounds`](https://www.npmjs.com/package/@copperdesign/lazy-video-backgrounds)
and installable in any project with:

```sh
npm install @copperdesign/lazy-video-backgrounds
```

For future releases:

```sh
npm version patch        # or minor / major — bumps package.json, commits, tags vX.Y.Z
git push --follow-tags
gh release create vX.Y.Z --generate-notes
```

The `release.yml` GitHub Actions workflow handles the rest: it smoke-checks
the module, verifies the tag matches `package.json`, and publishes to npm
with provenance. Requires an `NPM_TOKEN` repo secret minted from the
`copperdesign` npm account.

## License

MIT — see [LICENSE](./LICENSE).

Created by [Christian Fillies](https://www.christianfillies.de).
