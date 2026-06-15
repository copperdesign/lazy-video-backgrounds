---
name: Bug report
about: Something broke or behaved unexpectedly
title: ''
labels: bug
assignees: ''
---

## What happened

<!-- One paragraph. What you set up, what you saw, what you expected. -->

## Repro

<!-- A minimal HTML page that reproduces it. A Gist or CodePen link is
     fine. The smaller the repro, the faster the fix. -->

```html
<div id="hero">
  <video preload="auto" muted playsinline>
    <source src="..." type="video/mp4">
  </video>
  <!-- ... -->
</div>
<script type="module">
  import lazyVideoBackgrounds from 'lazy-video-backgrounds';
  lazyVideoBackgrounds(document.getElementById('hero'));
</script>
```

## Environment

- Package version (from `package.json` or `npm ls lazy-video-backgrounds`):
- Browser + version:
- OS (+ mobile/desktop):

## Screen recording (optional)

<!-- For anything visual — sequencing glitches, fade artifacts,
     offscreen-pause misfires — a short clip is worth a thousand words. -->
