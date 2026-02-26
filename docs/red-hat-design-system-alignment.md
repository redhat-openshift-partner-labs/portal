# Red Hat Design System Alignment Guide

This document outlines recommended style changes to align the application with the [Red Hat Design System (RHDS)](https://ux.redhat.com/).

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Fonts & Colors | ✅ Completed |
| Phase 2 | Interactions & Tokens | 📋 Documented |

---

## Phase 1: Completed Changes

### Fonts
- **Sans (headings):** Red Hat Display
- **Alt (body):** Red Hat Text
- **Mono (code):** Red Hat Mono

### Colors
- **Primary:** Red Hat Red (`#EE0000`)
- **Muted:** Gray palette (PatternFly-aligned)
- **Links:** PatternFly Blue (`#0066CC`)
- **Semantic:** Success, Warning, Danger, Info (PatternFly-aligned)

**Files modified:**
- `/app/assets/main.css`
- `/nuxt.config.ts`

---

## Phase 2: Recommended Changes

### 1. Focus Indicators (High Priority - Accessibility)

**Current state:** 1px ring with muted-800 color

**RHDS specification:**
- Outline: 3px solid (not 1px ring)
- Color: Blue (`#0066CC` light / `#73BCF7` dark)
- Offset: 3px from element
- Use `:focus-visible` pseudo-class

**Implementation:**
```css
/* Add to main.css @theme block */
--color-focus: #0066CC;
--color-focus-dark: #73BCF7;

/* Override Shuriken UI focus utility */
@utility nui-focus {
  @apply outline-3 outline-offset-3 outline-[var(--color-focus)];
  @apply dark:outline-[var(--color-focus-dark)];
}
```

---

### 2. Link Styling (High Priority)

**Current state:** Links have no underlines, component-specific hover colors

**RHDS specification:**
- Default: Dashed underline, 1px thickness, 5px offset
- Underline color: gray-50 (`#707070`)
- Hover: Solid underline, 6px offset, link color
- Transition: 0.3s ease
- Visited: Purple (`#40199A`)

**Implementation:**
```css
/* Add to main.css after @theme block */
a:not([class*="no-underline"]):not(nav a) {
  color: var(--color-link);
  text-decoration: underline;
  text-decoration-style: dashed;
  text-decoration-thickness: 1px;
  text-decoration-color: #707070;
  text-underline-offset: 5px;
  transition: text-underline-offset 0.3s ease, color 0.3s ease, text-decoration-color 0.3s ease;
}

a:not([class*="no-underline"]):not(nav a):hover {
  color: var(--color-link-hover);
  text-decoration-style: solid;
  text-decoration-color: var(--color-link-hover);
  text-underline-offset: 6px;
}

a:not([class*="no-underline"]):not(nav a):visited {
  color: var(--color-link-visited);
}
```

**Note:** The `:not()` selectors preserve existing navigation/button styling.

---

### 3. Spacing Tokens (Medium Priority)

**Current state:** Tailwind default spacing scale

**RHDS 4px grid:**
| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |
| 4xl | 80px |

**Implementation:**
```css
/* Add to main.css @theme block */
--rh-space-xs: 4px;
--rh-space-sm: 8px;
--rh-space-md: 16px;
--rh-space-lg: 24px;
--rh-space-xl: 32px;
--rh-space-2xl: 48px;
--rh-space-3xl: 64px;
--rh-space-4xl: 80px;
```

---

### 4. Dark Mode Surface Colors (Medium Priority)

**Current state:** Tailwind gray defaults

**RHDS dark surfaces:**
| Surface | Hex |
|---------|-----|
| Darkest (base) | `#151515` |
| Darker (elevated) | `#1F1F1F` |
| Dark (cards) | `#292929` |

**Implementation:**
```css
/* Add to main.css @theme block */
--color-surface-darkest: #151515;
--color-surface-darker: #1F1F1F;
--color-surface-dark: #292929;
```

---

## Verification Checklist

- [ ] Focus indicators: Tab through interactive elements, verify blue 3px outline
- [ ] Link styling: Check inline links have dashed underlines
- [ ] Dark mode: Toggle dark mode, verify surface colors
- [ ] Accessibility: Run Lighthouse audit, verify focus contrast (3:1 minimum)
- [ ] Regression: Navigation links, buttons, cards still work correctly

---

## Sources

- [RHDS Focus Indicators](https://ux.redhat.com/foundations/interactions/focus-indicators/)
- [RHDS Link Styling](https://ux.redhat.com/foundations/interactions/links/)
- [RHDS Spacing](https://ux.redhat.com/foundations/spacing/)
- [RHDS Color Palettes](https://ux.redhat.com/theming/color-palettes/)
- [RHDS Typography](https://ux.redhat.com/foundations/typography/)
