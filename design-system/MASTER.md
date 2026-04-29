# First Dibs — Design System MASTER

**Tool type:** Civic / public-interest housing intelligence tool  
**Audience:** First-time and repeat homebuyers in Cuyahoga County, Ohio — including users with limited financial or technical literacy, non-native English speakers, and people on mobile devices  
**Core job:** Help a buyer understand whether a neighborhood is investor-saturated *before* they waste time on a home that will be snatched away

---

## 1. Design Principles

### 1.1 Trust over sophistication
This is not a startup product dashboard. It is closer to a public health map or a county property lookup. Every design decision should reduce anxiety, not manufacture urgency.

- No countdown timers, "hot market" badge animations, or pulsing indicators
- Data uncertainty (low sample sizes, proxy metrics) is surfaced, not hidden
- Sources and vintage dates are always visible near the data they describe
- Risk language is descriptive ("High investor activity"), not alarmist ("DANGER")

### 1.2 Legibility first
Users may be on a phone, in poor lighting, under financial stress, or unfamiliar with terms like "sale-to-list ratio." Design for that reality.

- Body text minimum: 15px / 1rem (16px base)
- Line height: 1.65 for body, 1.3 for headings
- No text smaller than 12px anywhere user-facing
- Abbreviations always explained on first use or in a tooltip

### 1.3 WCAG AA compliance (minimum)
- All text/background combinations: contrast ratio ≥ 4.5:1 (normal text) or 3:1 (large text / UI components)
- Focus indicators visible and not suppressed
- All interactive elements keyboard-reachable
- Map is supplemented by the search input (map alone is not the only path)
- Color is never the *only* indicator of risk — labels accompany every color

### 1.4 No dark mode by default
Light mode only for v1. The color-coded map requires reliable color perception. Dark mode introduces significant complexity for the choropleth palette and is deferred.

### 1.5 No aggressive conversion patterns
- No email capture gates
- No "Sign up to see more" walls
- No urgency language ("Only 3 homes left in this ZIP!")
- The OHFA assistance link is informational, not a CTA dressed as a button

---

## 2. Color System

### 2.1 Brand palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#1a3a2a` | Nav background, primary button, section headers |
| `--primary-dark` | `#0f2419` | Button hover, footer background |
| `--primary-light` | `#2d5a3d` | Hero gradient midpoint |
| `--accent` | `#2e7d4f` | Links, focus rings, explainer dots |
| `--accent-bright` | `#3d9c65` | Logo icon fill, inline highlights |

**Rationale for darkening from current values:**  
Current `--primary: #0f4c35` and `--accent-bright: #22c55e` have a contrast ratio of 2.8:1 against white — failing AA on body text. The new values push both ends to achieve ≥ 4.5:1 for text uses.

### 2.2 Surface palette

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#f5f7f5` | Page background |
| `--surface` | `#ffffff` | Cards, panels |
| `--surface-2` | `#f0f4f1` | Stat boxes, inset areas |
| `--text` | `#1a1f1a` | Primary body text |
| `--text-muted` | `#4a5568` | Secondary text, labels |
| `--text-light` | `#718096` | Tertiary, placeholders, sources |
| `--border` | `#d1dbd4` | Card borders, dividers |

### 2.3 Risk / choropleth palette
These colors must be distinguishable by people with deuteranopia (most common color vision deficiency). The current red-green scale is problematic. Replacement:

| Score | Label | Color | Hex | Notes |
|---|---|---|---|---|
| 0–15 | Low | Teal | `#2c7bb6` | Blue anchor — distinguishable from all others |
| 16–30 | Moderate | Blue-green | `#5aae61` | |
| 31–45 | Elevated | Yellow | `#d9ef8b` | Neutral yellow, not alarm |
| 46–60 | High | Amber | `#f0a500` | Warm but not red |
| 61–75 | Very High | Orange | `#d4522a` | |
| 76–100 | Extreme | Dark red | `#8c1c13` | |

**Note:** Replacing the current red-green gradient also removes the implication that "low = good / high = bad" in a moralistic sense. Teal-to-red is a neutral sequential scale that reads as "intensity" rather than "danger."

*Implementation note:* the `getColor()` and `getRiskLabel()` functions in index.html must be updated together when this change is applied.

### 2.4 Semantic colors (inline use only, not backgrounds)

| Purpose | Hex | Usage |
|---|---|---|
| Info | `#2563eb` | "low sample" flag text |
| Caution | `#b45309` | Data gap notices |
| Positive | `#166534` | "data is fresh" indicators |

---

## 3. Typography

### 3.1 Typefaces
- **Primary:** Inter (already loaded via Google Fonts) — keep
- **Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Monospace (data values):** `'Roboto Mono', 'Courier New', monospace` — for stat numbers to prevent layout shift when digits change

### 3.2 Scale

| Role | Size | Weight | Line height |
|---|---|---|---|
| Hero H1 | `clamp(28px, 5vw, 48px)` | 800 | 1.15 |
| Section heading (H2) | `20px` | 700 | 1.25 |
| Card label (eyebrow) | `11px` | 600 | 1.4 — uppercase, +0.6px tracking |
| Body | `15px` | 400 | 1.65 |
| Small / secondary | `13px` | 400 | 1.6 |
| Micro / sources | `12px` | 400 | 1.7 |
| Stat value | `24px` | 700 | 1.1 |
| Stat unit | `13px` | 500 | — |

### 3.3 Rules
- No `font-size` below 12px
- `text-transform: uppercase` only on eyebrow labels, never on body text
- `-webkit-font-smoothing: antialiased` on body — already present, keep

---

## 4. Spacing

8px base unit. All spacing values are multiples of 4px.

| Token | Value | Common use |
|---|---|---|
| `--space-1` | `4px` | Tight inline gaps |
| `--space-2` | `8px` | Icon-to-label, tag padding |
| `--space-3` | `12px` | Stat box padding |
| `--space-4` | `16px` | Card inner padding (mobile) |
| `--space-5` | `20px` | Between card sections |
| `--space-6` | `24px` | Card padding (desktop), between cards |
| `--space-8` | `32px` | Section top padding |
| `--space-12` | `48px` | Hero vertical padding |
| `--space-16` | `64px` | Page section gap |

---

## 5. Border radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | `6px` | Badges, tags, small chips |
| `--radius` | `10px` | Buttons, inputs, stat boxes |
| `--radius-lg` | `16px` | Cards, map wrapper |
| `--radius-xl` | `24px` | Hero search bar container |

---

## 6. Elevation (shadows)

| Level | CSS | Use |
|---|---|---|
| 0 | `none` | Flat inset elements (`--surface-2`) |
| 1 | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)` | Cards |
| 2 | `0 4px 12px rgba(0,0,0,0.08)` | Map wrapper, floating panels |
| 3 | `0 8px 24px rgba(0,0,0,0.12)` | Search bar (on hero), dropdowns |

---

## 7. Components

### 7.1 Nav
- Height: 60px (reduced from 64px — less dominant)
- Logo: SVG house icon (replace emoji — emoji render inconsistently across OS)
- Remove the uppercase tagline on mobile (already done), also visually de-emphasize it on desktop (opacity 0.5 is fine, but `font-size: 11px` is borderline — raise to `12px`)
- Focus: white `2px solid white` ring with `2px offset`

### 7.2 Hero
- Gradient: keep dark green direction, remove the tiling SVG pattern (adds visual noise, contributes nothing to the civic tone)
- H1: reduce letter-spacing from `-1px` to `-0.5px` — the aggressive tracking reads as tech-startup
- Search bar: increase input font-size to `16px` minimum to prevent iOS auto-zoom (already at 16px — keep)
- Search button label: "Check ZIP" is fine and clear
- Hero padding: reduce bottom from 80px to 60px — the hero is decorative, not a landing page

### 7.3 Cards
- Border: `1px solid var(--border)` — keep
- Shadow: level 1 (lighter than current)
- Padding: `20px` desktop, `16px` mobile (reduce from 24px — less wasted space on small screens)
- Card label (eyebrow): raise from `10px` to `11px` — 10px fails WCAG on most backgrounds

### 7.4 Info card (ZIP selected state)
- Score badge: replace inline `background: var(--bg)` with a left-border accent bar (4px wide, color = risk color) — communicates risk level without relying on the number alone
- Risk bar: keep, it's doing useful work
- Stat boxes: use monospace for the number values to prevent layout shift
- "Low sample" flag: currently just text appended to the subtitle. Upgrade to a small inline badge with an info icon (`ⓘ`) that explains what low sample means on hover/focus

### 7.5 Explainer card
- Current bullet-dot style is fine; increase body text from `13px` to `14px`
- Bold terms should link to a glossary anchor or tooltip — deferred to v2

### 7.6 Map legend
- Currently uses 10px uppercase text — raise to `11px`
- Dots are 10px — keep, but add a short text label next to each (currently present — keep)
- Ensure the legend doesn't overlap map controls on mobile

### 7.7 Footer
- Currently is a dark banner. Simplify to a light `--surface-2` strip with `--text-muted` text
- This removes the visual "end cap" that implies a commercial site
- Keep the data attribution line — it builds trust

### 7.8 Buttons
- Primary button: `height: 44px` minimum (touch target)
- Focus: `outline: 2px solid var(--accent); outline-offset: 2px`
- No `transform: scale(0.97)` on active — this is a micro-interaction that reads as playful, not civic

---

## 8. Accessibility checklist

- [ ] All text contrast ≥ 4.5:1 (verify after color system update)
- [ ] Focus visible on: nav link, search input, search button, map polygons (tab order), legend
- [ ] `<html lang="en">` — present
- [ ] `<input>` has visible `<label>` or `aria-label` — currently missing; add `aria-label="Enter ZIP code"`
- [ ] Map: add `aria-label="Cuyahoga County competition map"` to the `#map` div
- [ ] Score displayed as text AND color (currently score number shown — good)
- [ ] `alert('...')` in `searchZip()`: replace with inline error message — native `alert()` is inaccessible (no styling, focus trap)
- [ ] Emoji in logo (`🏡`): wrap in `<span aria-hidden="true">` or replace with SVG

---

## 9. Motion / animation

- Risk bar fill: `transition: width 0.4s ease-out` — keep, it's informative
- All other transitions: max `0.15s` ease
- No entrance animations, parallax, or scroll effects — they add cognitive load and are not appropriate for a civic tool
- Respect `prefers-reduced-motion`: wrap risk bar transition in a media query check

---

## 10. Responsive breakpoints

| Name | Width | Notes |
|---|---|---|
| Mobile | < 640px | Single column, map height 360px |
| Tablet | 640–900px | Single column, map height 420px |
| Desktop | > 900px | Two-column grid (map + sidebar) |

Current breakpoint at 900px is correct. Add 640px for map height adjustment on small phones.

---

## 11. What this design system intentionally excludes

- **Dark mode** — deferred; choropleth color accuracy on dark backgrounds requires full re-testing
- **Animation library** — no Framer Motion, GSAP, or similar; plain CSS transitions only
- **Component library** (Radix, shadcn, etc.) — single-file static site; custom CSS only
- **Design tokens via CSS-in-JS** — CSS custom properties (`--var`) are sufficient
- **AI-generated color palettes** — colors chosen from WCAG contrast tables and colorblindness simulation tools, not aesthetic generators
