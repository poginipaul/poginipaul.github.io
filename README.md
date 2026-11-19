# poginipaul.github.io

Personal portfolio site for Paul — Network & Systems Administrator.
Static HTML, CSS, and a small amount of vanilla JavaScript. No build step, no
frameworks, no dependencies: push to `main` and GitHub Pages serves it as is.

## Structure

```
index.html      single page: hero, about, experience, projects, certifications, skills, contact
css/style.css   all styles, design tokens, dark theme, responsive and print rules
js/main.js      theme toggle, navigation, scroll reveal, scrollspy
img/            avatar and favicon
assets/         résumé PDF and self-hosted fonts
```

## Modern web platform notes

The site follows the [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance)
browser guidance. No polyfills or third-party requests are involved.

- **Navigation** — one `<ul>` for every screen size. It is a native `popover`
  (top layer, light dismiss, Escape, focus return) and becomes an inline row when
  the header's contents fit. `js/main.js` decides by measuring the row, so there
  is no breakpoint to keep in sync with the links. Browsers without the Popover
  API get the `is-open` fallback in `main.js`.
- **Scrollspy** — `scroll-target-group: auto` with `:target-current` highlights
  the section in view with no scroll math; script mirrors it to `aria-current`
  and falls back to `IntersectionObserver` where unsupported.
- **Motion** — reveal and hover effects use the individual `translate`, `scale`
  and `rotate` properties so they stay on the compositor, and everything honours
  `prefers-reduced-motion`.
- **Fonts** — Inter and Sora are self-hosted in `assets/fonts` (latin variable
  woff2, `font-display: swap`), so the page loads nothing from `fonts.googleapis.com`.
  `color-scheme` is set per theme so native scrollbars and controls match.

## Local preview

```bash
python3 -m http.server 3000
# then open http://localhost:3000
```

## Résumé download

The header, hero and contact section link to `assets/Paul-Basongit-Resume.pdf`
with a `download` attribute, so recruiters get the file instead of a PDF viewer.
To update it, replace that file (keeping the name) or change the three `href`s in
`index.html`. The contact card also shows the page count and file size — update
that line if the new PDF differs.

## Editing content

- **Name / role** — `index.html`, hero `<h1>`, the brand in the header, and the
  `<title>` plus Open Graph tags.
- **Contact** — currently links to GitHub and Instagram. To add an email, replace
  one of the buttons in the contact section with
  `href="mailto:you@example.com"` (and add it to the JSON-LD block in `<head>`).
- **Experience / certifications / skills** — plain list markup; copy an existing
  item and edit the text.
- **Projects** — each entry is a `.project-card` in the `#projects` list. Copy a
  card and edit the title, description and `.project-tech` chips. The media area
  currently shows a "coming soon" placeholder; to add a picture, replace the
  `<span class="project-media-fallback">…</span>` inside `<figure class="project-media">`
  with `<img src="img/projects/name.jpg" alt="Describe the image" width="1200" height="750" loading="lazy">`
  (16:10 crops cleanly; any size is scaled to fit).
- **Photo** — replace `img/ava.jpg` with a square image (330 × 330 or larger).
- **Résumé** — replace `assets/Paul-Basongit-Resume.pdf`; the download buttons
  pick it up automatically.
- **Colours** — the `:root` block at the top of `css/style.css` holds every colour
  and radius. `--accent` controls the highlight colour in both themes.
- **Theme** — the site follows the visitor's system preference and can be switched
  manually; the choice is stored in `localStorage`.

## Print

The stylesheet includes print rules, so `Ctrl/Cmd + P` produces a clean,
single-column résumé without the navigation, hero buttons, or photo.
