<!--
Thanks for the PR. A few prompts to make review faster — delete anything
that doesn't apply.
-->

## What

<!-- One or two sentences. What this PR changes. -->

## Why

<!-- The motivating problem. A real site that broke, a browser quirk you
     hit, an edge case the README missed. Skip the WHAT (the diff shows
     it); the WHY is what I'm reading for. -->

## How tested

<!-- Which browser(s) + OS you exercised it in. Mobile Safari catches the
     most autoplay-policy edge cases — note it if you tested there. A
     short screen recording for anything visible saves a lot of back-and-
     forth. -->

- [ ] Opened `example.html` in a fresh browser and confirmed the playlist
      sequences, loops the active clip, and pauses offscreen
- [ ] Spot-checked in at least one non-Chromium browser (Safari or Firefox)
- [ ] If teardown / event-listener code touched: confirmed `teardown()`
      actually stops playback progression

## Notes for reviewer

<!-- Anything subtle: a heuristic you chose between, a browser quirk you
     worked around, a follow-up you considered but punted. Optional. -->
