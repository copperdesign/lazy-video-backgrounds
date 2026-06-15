/**@preserve
 * lazy-video-backgrounds
 * by Christian Fillies <christian@manolab.com>
 * MIT License
 *
 * Sequentially-looping background-video playlist.
 *
 * Given a root element with N <video> children, plays one at a time and
 * advances to the next as soon as it's ready. While the next is still
 * buffering, the current one loops — so the user always sees motion
 * instead of a stall. When the root scrolls out of view, playback pauses.
 *
 * @docs README.md
 */

// HAVE_ENOUGH_DATA — browser believes it can play through without stalling.
const READY_ENOUGH = 4;

const defaults = {
  // Pick a starting clip and play it on init. False = caller takes over.
  autoplay: true,
  // Starting clip is random; false starts at the first child.
  random: true,
  // Pause when the root scrolls out of the viewport.
  pauseWhenOffscreen: true,
  // CSS hooks the host site can style. Customize if these clash.
  classNames: {
    playing: 'is-playing',
    paused: 'is-paused',
  },
};

/**
 * Initialize a video-background playlist on `root`.
 *
 * @param {HTMLElement} root      Container whose <video> children form the playlist.
 * @param {Object}      [options]
 * @returns {Function}            Teardown — removes listeners and disconnects the observer.
 *
 * @docs README.md#api
 */
export default function lazyVideoBackgrounds(root, options = {}) {
  if (!root) return noop;
  const opts = { ...defaults, ...options };
  const cls = { ...defaults.classNames, ...(options.classNames || {}) };

  const videos = Array.from(root.children).filter(el => el instanceof HTMLVideoElement);
  if (!videos.length) return noop;

  const teardowns = [];

  videos.forEach((video, i) => {
    const next = videos[(i + 1) % videos.length];

    // Seed readiness from BOTH directions:
    //  - readyState catches the case where canplaythrough already fired
    //    before our handler attached — a real race with preload="auto"
    //    on small clips: the event is gone by the time we get here.
    //  - the event keeps the flag accurate as buffering progresses later.
    video.canplaythru = video.readyState >= READY_ENOUGH;
    const onCanPlay = () => { video.canplaythru = true; };

    const onPlay = () => {
      videos.forEach(v => v.classList.remove(cls.paused));
      video.classList.add(cls.playing);
      // Browsers typically only preload the *playing* clip; the others
      // sit at readyState 0 forever. Explicitly start the next one
      // buffering — without this, canplaythrough never fires for
      // videos 2..N and we'd loop on this one indefinitely.
      if (next !== video && next.readyState === 0) next.load();
    };

    const onPause = () => {
      videos.forEach(v => v.classList.remove(cls.playing));
      video.classList.add(cls.paused);
    };

    const onEnded = () => {
      video.classList.remove(cls.playing, cls.paused);
      if (next.canplaythru) {
        video.pause();
        next.play().catch(noop);
      } else {
        // Next clip still buffering — loop current and nudge next to
        // keep loading. A later iteration escapes once it's ready.
        if (next.readyState === 0) next.load();
        video.currentTime = 0;
        video.play().catch(noop);
      }
    };

    video.addEventListener('canplaythrough', onCanPlay);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    teardowns.push(() => {
      video.removeEventListener('canplaythrough', onCanPlay);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    });
  });

  // Pause when the root scrolls out of view. IntersectionObserver beats
  // scroll-math: cheaper, fires only on visibility change, and catches
  // resize / programmatic scroll for free.
  if (opts.pauseWhenOffscreen && typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0].isIntersecting;
      const active = root.querySelector(`.${cls.playing}, .${cls.paused}`);
      if (!active) return;
      if (visible) active.play().catch(noop);
      else active.pause();
    }, { threshold: 0 });
    observer.observe(root);
    teardowns.push(() => observer.disconnect());
  }

  if (opts.autoplay) {
    const start = opts.random
      ? videos[Math.floor(Math.random() * videos.length)]
      : videos[0];
    start.play().catch(noop);
  }

  return () => teardowns.forEach(fn => fn());
}

function noop() {}
