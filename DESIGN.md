---
name: MyAuthify
description: Instant Auth & API Key Management for Modern Web Apps
colors:
  primary: "#c084fc"
  primary-bg: "rgba(192, 132, 252, 0.15)"
  primary-border: "rgba(192, 132, 252, 0.5)"
  neutral-bg: "#16171d"
  neutral-surface: "#1f2028"
  neutral-border: "#2e303a"
  text-primary: "#f3f4f6"
  text-muted: "#9ca3af"
typography:
  display:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)"
    fontWeight: 500
    lineHeight: "1.15"
    letterSpacing: "-1.68px"
  headline:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: "1.2"
    letterSpacing: "-0.24px"
  body:
    fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "1.45"
  label:
    fontFamily: "ui-monospace, Consolas, monospace"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "1.35"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-bg}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  button-primary-hover:
    backgroundColor: "{colors.primary-bg}"
  card-base:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "32px"
  input-base:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: MyAuthify

## Overview

**Creative North Star: "The Developer Monolith"**

MyAuthify delivers a high-precision, developer-first aesthetic inspired by modern infrastructure tools (such as BetterAuth). Built around an obsidian dark mode base (`#16171d`), the visual atmosphere emphasizes crisp typography, high-contrast monospace code blocks, and electric violet accents (`#c084fc`).

The interface avoids unnecessary decorative clutter, relying instead on clean structural dividers (`#2e303a`), subtle translucency, and precise micro-interactions. Information density is tuned for scanning code snippets, active session state, and API key credentials effortlessly.

**Key Characteristics:**
- Deep obsidian background with subtle borders and clean structural framing.
- Electric violet glow accents for active states, badges, and primary interactive elements.
- Monospaced typography for code sandboxes, session tokens, and key prefixes.
- High-contrast hierarchy for maximum legibility in developer workflows.

## Colors

The color system relies on an obsidian dark mode base accented with a vibrant violet brand tone.

### Primary
- **Electric Violet** (`#c084fc` / `rgba(192, 132, 252, 0.15)`): Used exclusively for primary CTA highlights, active tab indicators, session badges, and key interactive states.

### Neutral
- **Obsidian Core** (`#16171d`): The foundational canvas background.
- **Surface Elevation** (`#1f2028`): Card background, code container, and input surface fill.
- **Structural Border** (`#2e303a`): Divider lines, card outlines, and grid framing.
- **High-Contrast Text** (`#f3f4f6`): Primary headings and code text.
- **Muted Text** (`#9ca3af`): Body text, labels, and secondary metadata.

### Named Rules
**The Single-Accent Rule.** The electric violet accent (`#c084fc`) is reserved for interactive actions, focus rings, and active state indicators. It occupies under 10% of any screen surface to preserve visual power.

## Typography

**Display Font:** `system-ui, 'Segoe UI', Roboto, sans-serif`
**Body Font:** `system-ui, 'Segoe UI', Roboto, sans-serif`
**Label/Mono Font:** `ui-monospace, Consolas, monospace`

**Character:** Clean, technical, and highly legible with distinct monospaced formatting for all technical outputs (tokens, IDs, code snippets).

### Hierarchy
- **Display** (Weight 500, `clamp(2.25rem, 5vw, 3.5rem)`, Line-Height `1.15`): Main landing page headers and hero title.
- **Headline** (Weight 500, `1.5rem`, Line-Height `1.2`): Section titles, modal titles, and card headers.
- **Body** (Weight 400, `1.125rem`, Line-Height `1.45`): Explanatory text, feature descriptions, and documentation prose.
- **Label** (Weight 400, `0.9375rem`, Line-Height `1.35`): Code blocks, API key prefixes, token hashes, and badge text.

## Layout

Layout follows a centered max-width container (`1126px`) bounded by subtle structural vertical borders (`border-inline: 1px solid #2e303a`). Spatial rhythm uses an 8px base grid (`8px`, `16px`, `24px`, `32px`).

Responsive behavior collapses multi-column feature grids into single-column cards on viewports under `1024px`.

## Elevation & Depth

MyAuthify uses a flat, layered-surface model with subtle ambient depth. Depth is created through background color shifts (`#16171d` canvas vs. `#1f2028` surface) and crisp border strokes rather than heavy drop shadows.

### Shadow Vocabulary
- **Subtle Surface Shadow** (`rgba(0, 0, 0, 0.4) 0 10px 15px -3px`): Used on hover for interactive cards and floating modals.

### Named Rules
**The Layered Surface Rule.** Surfaces do not float arbitrarily; depth is expressed by stacking translucent surface colors with explicit 1px border framing (`#2e303a`).

## Shapes

Form language is modern, crisp, and slightly rounded:
- **Buttons & Badges**: Small 4px to 6px border radius (`border-radius: 4px`).
- **Cards & Inputs**: 6px to 8px border radius (`border-radius: 6px`).
- **Structural Lines**: 1px solid borders (`#2e303a`) framing major viewports and panels.

## Components

### Buttons
- **Shape:** Gently rounded corners (`4px` / `6px`).
- **Primary:** Violet translucent fill (`rgba(192, 132, 252, 0.15)`), violet text (`#c084fc`), 1px transparent border.
- **Hover / Focus:** Border shifts to `rgba(192, 132, 252, 0.5)` with subtle glow.

### Cards / Containers
- **Corner Style:** 6px radius (`border-radius: 6px`).
- **Background:** Surface dark fill (`#1f2028`).
- **Border:** 1px solid `#2e303a`.
- **Internal Padding:** 32px (`24px` on mobile).

### Inputs / Fields
- **Style:** Surface dark fill (`#1f2028`), `#2e303a` border, high-contrast text (`#f3f4f6`).
- **Focus:** 2px violet focus ring (`#c084fc`) with `2px` outline offset.

### Code Blocks & Badges
- **Style:** Monospaced font, surface fill (`#1f2028`), 4px radius, compact padding (`4px 8px`).

## Do's and Don'ts

### Do:
- **Do** use monospaced typography (`ui-monospace`) for all API keys, session tokens, and code snippets.
- **Do** keep borders crisp and 1px wide using `#2e303a` for clear structural division.
- **Do** reserve the violet accent (`#c084fc`) for interactive actions and status highlights.

### Don't:
- **Don't** use heavy drop shadows or bright colored backgrounds for non-interactive cards.
- **Don't** mix multiple accent colors on the same view; keep the palette unified around obsidian & violet.
- **Don't** override monospaced font formatting on API tokens or code previews.
