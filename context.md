# MathPro Admin site— Project Context

## What MathPro Is

MathPro is a Bengali-first online learning platform (LMS) targeting **JSC, SSC, and HSC students in Bangladesh**. The product sells structured math courses taught by local teachers. Every design and copy decision is optimised for this audience — teenage students on mobile phones, often on slower connections, who need to feel confident and motivated to enrol. This site is for admin to manage the platform seemlessly.

---

## Audience

| Signal             | Detail                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| **Age**            | 13–18 (JSC → HSC)                                                        |
| **Language**       | Bengali primary, English secondary                                       |
| **Device**         | Mobile-first; most traffic on Android                                    |
| **Motivation**     | Board exam prep, fear of math, peer competition                          |
| **Trust triggers** | Enrolled count, teacher credibility, refund guarantee, peer testimonials |

All CTAs, labels, badges, and status text must be written in Bengali. English is acceptable only for technical UI chrome (e.g., form field placeholders, nav icons).

---

## Product Terminology

- Public-facing marketing and UI copy must use **"Combo" / "কোর্স Combo"** for multi-course offers.
- Admin-facing `/combos` copy should also use **"Combo"** in headings, badges, CTAs, and empty states.
- Backend/API/internal types can remain `bundle` where needed for compatibility, but displayed text on the `/combos` surface must stay combo-first.
- The backend field name remains `url`, but the admin UI should label it as **"Slug"**, not "URL".
- Admin combo detail/edit routes may be opened by numeric id or by slug, but writes and internal mutations must still resolve to the numeric bundle id.

---

## Tech Stack

| Layer         | Choice                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | **Next.js 16** (App Router) — breaking changes vs older versions; always read `node_modules/next/dist/docs/` before writing router code |
| Styling       | **Tailwind CSS v4** — canonical gradient class is `bg-linear-to-{dir}`, NOT `bg-gradient-to-{dir}`                                      |
| UI primitives | shadcn/ui (via `components.json`)                                                                                                       |
| Fonts         | **Anek Bangla** (default sans + heading + Bengali), Geist Mono (code), Manrope (English accent)                                         |
| Animation     | Framer Motion                                                                                                                           |
| React         | 19.2                                                                                                                                    |

---

## Design Tokens

All tokens are defined as CSS custom properties in `src/app/globals.css` and aliased into Tailwind's `@theme inline` block. **Never use raw hex or oklch values in JSX.** Always use the token class name.

### Colour Palette

#### Brand

| Token         | Class                                        | Role                                             |
| ------------- | -------------------------------------------- | ------------------------------------------------ |
| `--primary`   | `text-primary` / `bg-primary`                | Emerald — main brand colour, CTAs, active states |
| `--teal`      | `text-teal` / `bg-teal`                      | Secondary cool accent, gradients                 |
| `--accent`    | `text-accent` / `bg-accent`                  | Vivid orange — call-to-action highlights         |
| `--secondary` | `text-secondary-foreground` / `bg-secondary` | Warm amber tint                                  |

#### Semantic (LMS)

| Token           | Class                         | Use                              |
| --------------- | ----------------------------- | -------------------------------- |
| `--success`     | `text-success` / `bg-success` | Enrolled / live / correct answer |
| `--warning`     | `text-warning` / `bg-warning` | Prebooking / deadline / caution  |
| `--info`        | `text-info` / `bg-info`       | Informational badges             |
| `--destructive` | `text-destructive`            | Errors, delete actions           |

#### Surface

| Token                         | Class                           | Use                                          |
| ----------------------------- | ------------------------------- | -------------------------------------------- |
| `--background`                | `bg-background`                 | Page background                              |
| `--card`                      | `bg-card`                       | Card / sidebar / modal surfaces              |
| `--muted`                     | `bg-muted`                      | Subtle fill (hover, disabled)                |
| `--border`                    | `border-border`                 | All borders                                  |
| `--muted-foreground`          | `text-muted-foreground`         | Secondary body text                          |
| `--section-a` / `--section-b` | `bg-section-a` / `bg-section-b` | Alternating zebra-stripe section backgrounds |

#### Forbidden patterns

- `text-darkHeading`, `text-paragraph` — legacy tokens removed from the system
- `bg-purple`, `bg-[#…]`, `text-[#…]` — hardcoded colours
- `bg-gradient-to-*` — Tailwind v4 dropped this; use `bg-linear-to-*`
- `top-[68px]` — use the spacing scale (`top-17`) unless truly arbitrary

### Typography

- **Heading scale:** `text-3xl` → `text-[2.6rem]` → `text-5xl` (mobile → tablet → desktop)
- **Body:** `text-base` / `text-lg` / `text-muted-foreground` for secondary
- **Font weight:** `font-bold` / `font-extrabold` for prices and hero titles; `font-semibold` for section headings; `font-medium` for UI labels
- **Line height:** `leading-tight` / `leading-snug` on large headings
- **Bengali numerals:** always convert via `englishToBanglaNumbers()` helper before rendering counts or days

### Border Radius

Scaled off `--radius: 0.5rem`:

| Token          | Class         | Typical use                 |
| -------------- | ------------- | --------------------------- |
| `--radius-sm`  | `rounded-sm`  | Tags, small chips           |
| `--radius-lg`  | `rounded-lg`  | Input fields, small cards   |
| `--radius-xl`  | `rounded-xl`  | Medium cards                |
| `--radius-2xl` | `rounded-2xl` | Sidebar cards, modals       |
| `--radius-3xl` | `rounded-3xl` | Hero images, featured cards |

---

## Visual Aesthetics

### Core principles

1. **Premium but accessible** — feels modern (glassmorphism, blur, shadows) but loads fast and reads clearly on a small screen.
2. **Trust-first** — enrolled counts, refund guarantee, teacher photos, live pulse dots all appear near the buy CTA.
3. **Emerald as hero** — `--primary` (emerald) is the dominant hue. Every active state, highlight, or progress indicator uses it.
4. **Dark mode is first-class** — all tokens have dark overrides. Never hard-code a colour that breaks on dark backgrounds.

### Recurring visual patterns

| Pattern                | Implementation                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| Glassmorphism panels   | `backdrop-blur-md bg-background/90` or `bg-card/80`                                               |
| Gradient CTAs          | `bg-linear-to-r from-primary to-primary/85`                                                       |
| Gradient backgrounds   | `bg-linear-to-br from-primary/20 to-teal/20`                                                      |
| Active tab indicator   | `border-b-2 border-primary bg-primary/8` + small `rounded-full bg-primary` dot at bottom center   |
| Status badge — live    | green pulse dot `animate-pulse` + "ভর্তি চলছে" in `text-success bg-success/15 border-success/40`  |
| Status badge — prebook | clock icon + "প্রিবুকিং চলছে" in `text-warning bg-warning/15 border-warning/40`                   |
| Pill feature cards     | `bg-primary/5 border border-primary/15 rounded-lg` with a filled checkmark icon in `text-primary` |
| Savings badge          | `bg-warning/15 text-warning border border-warning/30 rounded-full` — shows `X% ছাড়`              |
| Shadow depth           | `shadow-xl` on sticky sidebar cards; `shadow-2xl` on hero/banner elements                         |
| Subtle glow            | `blur-3xl` coloured `div`s as absolute decorative background elements                             |

### Sticky behaviours

## Combo Naming

### Key rules

- **No hardcoded colours.** Token classes only.
- **No `overflow-x-auto` on tab strips** that have a fixed, small number of tabs — just `flex items-center gap-1`.
- **Aspect ratio for media:** use `aspect-video` on thumbnail containers.
- **Gradient syntax:** `bg-linear-to-{dir}` (Tailwind v4).
- **Arbitrary spacing:** prefer scale values (`top-17`, `py-3.5`) over bracket notation unless truly one-off.
- **`React.ReactNode`** for icon prop types in tab/menu arrays.
- **Bengali numbers:** run through `englishToBanglaNumbers()` before rendering.

---

#

5. **Dark mode parity** — every component must look intentional in both light and dark themes.
