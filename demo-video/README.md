# First Dibs demo video

A ~80-second product walkthrough of First Dibs, built with [Remotion](https://www.remotion.dev/).
Every app screen in the video is a real screenshot of the site, captured with Playwright.

## Scenes

1. Intro
2. The problem (Lakewood 44107 stats from the app)
3. ZIP lookup: search a ZIP and get a competition score
4. Score breakdown: the six factors and "Why this score"
5. View presets: Default, Affordability first, Investor-aware, Speed of competition
6. Custom weights: drag a slider and watch the score change
7. Compare up to three ZIPs
8. Affordability calculator and affordability map views
9. Beat the Bid toolkit
10. Methodology page
11. Mobile layout
12. Outro

## Commands

```bash
npm install
npm run dev        # open Remotion Studio to preview
npm run render     # writes out/first-dibs-demo.mp4
```

### Re-capturing screenshots

The screenshots in `public/shots/` (and the element positions in `boxes.json`, which drive
the cursor and zoom animations) come from `capture/capture.js`. To refresh them after the site changes:

```bash
# from the repo root, serve the site locally
python3 -m http.server 8765
# in demo-video/
TILES=1 npm run capture
```

`TILES=1` loads the OpenStreetMap street basemap behind the ZIP shapes. Leave it off if the
tile servers aren't reachable; the map then shows the ZIP shapes over a plain grey background.
If element positions change, update the `BOX` coordinates in `src/scenes.tsx` from `boxes.json`.
