# Tax Advisor Pro - Shared Components Guide

## Overview

Two production-ready shared files have been created to eliminate CSS duplication and provide consistent navigation across all pages:

1. **shared-nav.js** - Bilingual sticky navigation injector (IIFE)
2. **shared-styles.css** - Global design system and base styles

## Quick Start

### Add to Every HTML Page

In the `<head>` section, add these lines **before** your page-specific styles:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
  
  <!-- SHARED STYLES -->
  <link rel="stylesheet" href="shared-styles.css">
  
  <!-- YOUR PAGE-SPECIFIC STYLES (OPTIONAL) -->
  <style>
    /* Override or add page-specific styles only */
  </style>
</head>
<body>
  <!-- Navigation is automatically injected by shared-nav.js -->
  
  <!-- Remove any existing .topnav, .topbar, or nav elements -->
  <!-- They will be replaced automatically -->
  
  <!-- YOUR PAGE CONTENT -->
  
  <!-- SHARED NAV SCRIPT - add before closing body -->
  <script src="shared-nav.js"></script>
</body>
```

## Features

### shared-nav.js (196 lines, 6.6 KB)

**Automatic Features:**
- Injects consistent navigation on every page
- Detects current page and highlights active link
- Removes old .topnav/.topbar elements
- Handles bilingual UI (English/Arabic)
- Mobile hamburger menu at 768px
- Language persistence with localStorage

**Navigation Links:**
- Home (index.html)
- Guides (guides.html)
- Tax Planner (tax-planner.html)
- ITIN Guide (itin-guide.html)
- E-File (efile.html)
- My Account (auth.html)

**Bilingual Support:**
- English labels and Arabic translations
- RTL layout for Arabic
- Language toggle button (EN/عربي)
- Fires `languageToggle` custom event when changed

**Color Scheme:**
- Navy primary: #0d3b66
- Dark navy: #092847
- Gold accent: #c9a84c

### shared-styles.css (636 lines, 17 KB)

**48 Design Tokens:**
- Colors: primary, accent, success, danger, warning, info (all with light variants)
- Backgrounds: bg, surface, surface-alt
- Text: text, text-muted
- Borders: border, border-light
- Border radius: sm, md, lg, xl, full
- Shadows: xs, sm, md, lg, glow
- Typography: heading, body fonts
- Transitions: fast (0.18s), normal (0.25s)

**Key Sections:**
1. Font imports (Plus Jakarta Sans + Noto Sans Arabic)
2. CSS reset (*, box-sizing)
3. Design tokens (:root)
4. Dark mode support ([data-theme="dark"])
5. Base typography (h1-h6, p, a, etc.)
6. Navigation styles (.shared-nav-*)
7. Responsive breakpoints (768px, 480px)
8. Utility classes (.hidden, .sr-only, .text-center, .text-ar)
9. Accessibility (focus-visible, prefers-reduced-motion)
10. Loading spinner (.page-loading)
11. Back-to-top button (.back-to-top)
12. Print styles
13. Form elements
14. Responsive typography

## Advanced Usage

### Listen for Language Changes

```javascript
window.addEventListener('languageToggle', (e) => {
  console.log('Language changed to:', e.detail.lang); // 'en' or 'ar'
  // Reload page content in new language
});
```

### Get Current Language

```javascript
console.log(window.appLang.current); // 'en' or 'ar'
console.log(window.appLang.isArabic()); // true/false
```

### Set Language Programmatically

```javascript
window.appLang.current = 'ar';
// Navigation updates and 'languageToggle' event fires
```

### Enable Dark Mode

```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

### Use Design Tokens in Custom CSS

```css
.my-button {
  background: var(--primary);
  color: var(--surface);
  padding: 12px 24px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}

.my-button:hover {
  background: var(--primary-light);
  box-shadow: var(--shadow-lg);
}
```

### Override Tokens Per Page

```html
<style>
  :root {
    --primary: #your-custom-color;
    /* Other overrides */
  }
</style>
```

## Responsive Behavior

### Desktop (> 768px)
- Full horizontal navigation
- Logo text visible
- Language toggle visible
- Hamburger hidden

### Tablet (768px - 481px)
- Hamburger menu appears
- Desktop nav hidden
- Tax Year badge hidden
- Language toggle shows abbreviation

### Mobile (< 480px)
- Further optimizations
- Language toggle hidden (mobile lang button only)
- Touch-friendly tap targets
- Hamburger menu primary navigation

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation (Tab, Enter)
- Screen reader support (.sr-only, aria-labels)
- Focus-visible outlines (3px accent color)
- Prefers-reduced-motion respected
- Color contrast maintained
- RTL layout support

## Performance

- Single CSS file cached across all pages
- Minimal JavaScript (6.6 KB IIFE)
- No external dependencies (Google Fonts only)
- SVG hamburger icon (no images)
- Smooth transitions optimized

## Maintenance

### Update Navigation Links
Edit `shared-nav.js`, line ~9-16:
```javascript
const navConfig = {
  links: [
    { href: 'page.html', labelEn: 'Label', labelAr: 'العربية' },
    // Add more links
  ]
};
```

### Update Colors
Edit `shared-styles.css`, line ~54-98 (`:root` section):
```css
:root {
  --primary: #new-color;
  --accent: #new-accent;
  /* etc */
}
```

### Update Typography
Edit `shared-styles.css`, line ~36-38:
```css
--font-heading: 'Font Name', fallback;
--font-body: 'Font Name', fallback;
```

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## File Sizes

- shared-nav.js: 6.6 KB (minified: ~3.5 KB)
- shared-styles.css: 17 KB (minified: ~12 KB)
- Total: 23.6 KB (minified: ~15.5 KB)

## Troubleshooting

### Navigation not appearing
- Ensure `<script src="shared-nav.js"></script>` is in body before closing
- Check browser console for errors
- Verify DOM is ready before script runs

### Styles not applying
- Ensure `<link rel="stylesheet" href="shared-styles.css">` is in head
- Check that shared-styles.css is loaded before page styles
- Clear browser cache

### Language not persisting
- Check localStorage is enabled
- Verify language toggle button is functional
- Check browser console for 'languageToggle' event

### Mobile menu not working
- Verify hamburger button appears on narrow screens
- Check touch events on mobile device
- Verify aria-expanded attribute changes

## Customization Examples

### Branded Color Override
```css
:root {
  --primary: #2a4d7c;
  --accent: #d4af37;
  --primary-dark: #1a2f4a;
}
```

### Custom Font
```css
@import url('https://fonts.googleapis.com/css2?family=Your+Font:wght@400;700');

:root {
  --font-body: 'Your Font', sans-serif;
}
```

### Additional Utility Classes
```css
.mt-1 { margin-top: 0.25rem; }
.p-2 { padding: 0.5rem; }
.border-top { border-top: 1px solid var(--border); }
/* etc */
```

## Support

For issues or questions:
1. Check shared-nav.js comments
2. Review shared-styles.css structure
3. Check browser DevTools console
4. Verify DOM structure matches expectations

---

**Version:** 1.0  
**Created:** March 29, 2026  
**Status:** Production Ready
