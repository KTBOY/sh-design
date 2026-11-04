---
name: Insight Architecture
colors:
  surface: '#f8fafb'
  surface-dim: '#d8dadb'
  surface-bright: '#f8fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f5'
  surface-container: '#eceeef'
  surface-container-high: '#e6e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#42474c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#eff1f2'
  outline: '#73777d'
  outline-variant: '#c3c7cd'
  surface-tint: '#476176'
  primary: '#001624'
  on-primary: '#ffffff'
  primary-container: '#0d2b3e'
  on-primary-container: '#7893aa'
  inverse-primary: '#aecae2'
  secondary: '#006a68'
  on-secondary: '#ffffff'
  secondary-container: '#79f2f0'
  on-secondary-container: '#006e6d'
  tertiary: '#2b0800'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d1600'
  on-tertiary-container: '#f4601e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cae6ff'
  primary-fixed-dim: '#aecae2'
  on-primary-fixed: '#001e30'
  on-primary-fixed-variant: '#2f4a5e'
  secondary-fixed: '#7df5f3'
  secondary-fixed-dim: '#5dd9d6'
  on-secondary-fixed: '#00201f'
  on-secondary-fixed-variant: '#00504f'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59a'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#802a00'
  background: '#f8fafb'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  deep-navy: '#0D2B3E'
  teal-accent: '#00A3A1'
  insight-orange: '#D44A00'
  slate-gray: '#4A5568'
  border-subtle: '#E2E8F0'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-tabular:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
  stack-sm: 4px
  stack-md: 12px
  stack-lg: 24px
---

## Brand & Style

This design system embodies a sophisticated, data-driven aesthetic tailored for high-performance B2B SaaS environments. The brand personality is authoritative yet accessible, focusing on clarity, precision, and the power of organized information. It draws heavily from **Modern Corporate** and **Minimalist** movements, prioritizing functional elegance over decorative flair.

The target audience consists of customer success managers, data analysts, and executive leadership who require a tool that feels like a professional workspace. The UI evokes a sense of "quiet power"—calm, structured, and exceptionally efficient. Visual density is managed through generous whitespace and a rigorous adherence to a systematic grid, ensuring that complex data sets remain legible and actionable.

## Colors

The palette is anchored by a professional hierarchy that balances deep authority with vibrant clarity. 

- **Primary (Deep Navy):** Used for core structural elements, navigation sidebars, and primary typography to establish a grounded, trustworthy foundation.
- **Secondary (Teal):** The "action" color. It signifies progress, success, and interactive states. It provides a modern, tech-forward contrast to the navy.
- **Tertiary (Insight Orange):** Reserved strictly for high-priority alerts, critical data points, or "New" feature indicators. Its warmth breaks the cool palette to draw immediate attention.
- **Neutral (Slate & Ice):** A range of cool grays and off-whites are used to define surface tiers, ensuring the interface feels layered rather than flat. 

The default mode is **Light**, utilizing a near-white background to maintain a "clean paper" feel that is conducive to long-form data analysis.

## Typography

The typography system uses a tri-font approach to differentiate between branding, content, and data.

1.  **Hanken Grotesk (Headlines):** Chosen for its sharp, contemporary geometry. It feels engineered and precise, ideal for high-level summaries and section headers.
2.  **Inter (Body):** The workhorse for the UI. Its exceptional legibility at small sizes makes it perfect for complex dashboards and dense property panels.
3.  **JetBrains Mono (Data/Labels):** Employed for metadata, IDs, and tabular data values. The monospaced nature ensures that columns of numbers align perfectly, reinforcing the "data-driven" narrative.

Hierarchy is enforced through weight and color rather than just size. Use `slate-gray` for secondary body text and `deep-navy` for titles.

## Layout & Spacing

This design system utilizes a **Fixed-Fluid Hybrid Grid**. On desktop, content is centered within a 1440px max-width container using a 12-column grid. On smaller viewports, the grid transitions to a fluid 4-column system.

Spacing follows a strict 8px linear scale. 
- **Dashboards:** Use a "Card-on-Grey" layout where the background is `neutral-color` and individual modules are white cards separated by `stack-lg` (24px) gutters.
- **Side Panels:** Use a fixed-width (320px) right-aligned drawer for contextual details, utilizing `stack-md` (12px) for internal padding.
- **Data Tables:** High-density spacing is permitted, reducing vertical row padding to 8px to maximize information visibility.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Low-Contrast Outlines**. 

- **Level 0 (Background):** `neutral-color` (#F8FAFB).
- **Level 1 (Default Surface):** Pure white (#FFFFFF) with a 1px border of `border-subtle`. No shadow is used for static elements to keep the interface flat and professional.
- **Level 2 (Interactive/Floating):** When an element is hovered or "lifted" (like a draggable card), apply a soft, ambient shadow: `0px 4px 12px rgba(13, 43, 62, 0.08)`.
- **Level 3 (Modals/Popovers):** Higher elevation with a more pronounced shadow and a 20% opacity backdrop blur (Glassmorphism) to maintain context of the underlying data.

## Shapes

The shape language is "Soft-Geometric." We use a conservative corner radius to maintain a professional, organized appearance while avoiding the harshness of sharp corners.

- **Standard Elements:** (Buttons, Inputs, Cards) use a **4px (0.25rem)** radius.
- **Large Containers:** (Modals, Feature Sections) use an **8px (0.5rem)** radius.
- **Tags/Chips:** May use a **12px** radius for distinct visual separation from functional buttons.

Icons should follow a 2px stroke weight with slight rounding on terminals to match the "Soft" radius of the UI components.

## Components

- **Buttons:** 
    - *Primary:* Solid `deep-navy` with white text. 
    - *Secondary:* Ghost style with `teal-accent` border and text. 
    - *Tertiary:* Flat text buttons for low-priority actions.
- **Input Fields:** 
    - White background with `border-subtle`. On focus, the border changes to `teal-accent` with a 2px outer glow. Labels use `label-caps` typography.
- **Data Chips:** 
    - Small, low-saturation backgrounds (e.g., light teal for "Active") with `body-sm` bold text.
- **Cards:** 
    - Defined by a 1px `border-subtle` and no shadow. The header of the card should use a subtle gray background (#F1F5F9) to separate the title from the content.
- **Status Indicators:** 
    - Small 8px dots using `insight-orange` (Critical), `teal-accent` (Healthy), and `slate-gray` (Inactive).
- **Navigation:** 
    - A narrow vertical sidebar in `deep-navy` with high-contrast white icons and teal active-state indicators.