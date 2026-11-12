# CVParser: project context

Context for AI coding assistants (Claude, Copilot, Cursor, Codex, …) and humans. `CLAUDE.md` imports this file.
Keep it up to date when you change architecture, commands or conventions.

## What this is

A bilingual (English / European Portuguese) CV and portfolio website for **João Alexandre** (Full-Stack PHP
Developer), built with **Angular 22**. All content comes from two JSON files (`src/assets/CV.json`,
`src/assets/CV.pt.json`). Visitors can:

- read the CV (home page: hero, about, skills, experience timeline, education),
- browse public GitHub repositories (Projects page, fetched live from the GitHub API),
- download a **one-page resume** or a **full CV** as PDF (generated in the browser, in the page's language),
- get in touch (Contact page, with copy-to-clipboard for email and phone),
- switch between English (`/home`, …) and Portuguese (`/pt/home`, …).

Live site: https://cv-parser-joao-alexandres-projects.vercel.app (Vercel; see *Deployment*).

## Commands

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Dev server (http://localhost:4200) | `npm start` (`ng serve`) |
| Production build + prerender | `npm run build` → `dist/cvparser/browser/` |
| Unit tests (Karma + Jasmine) | `npx ng test --watch=false --browsers=ChromeHeadless` |
| Security audit | `npm audit` (should report 0 vulnerabilities) |

On Windows, if Karma can't find Chrome, set `CHROME_BIN="C:/Program Files/Google/Chrome/Application/chrome.exe"`.

## Stack

- Angular 22: standalone components, signals, `@if`/`@for` control flow, `input()`, `viewChild()`. No NgModules.
- SSR + build-time **prerendering** of 9 routes (`/`, `/home`, `/projects`, `/contact`, `/404` and their `/pt/…`
  versions) with **client hydration** (`provideClientHydration(withEventReplay())`).
- Router: `withViewTransitions()` (route animations through the View Transitions API) and `withInMemoryScrolling` (scroll to top, anchor support).
- `HttpClient` with `withFetch()`.
- **jsPDF** (lazy-loaded) for PDFs. **@vercel/analytics** (`inject()` in `main.ts`). **bootstrap-icons** (icon font, imported once in `styles.css`).
- Plain CSS with design tokens. No Bootstrap/Tailwind/Material.
- Fonts (Google Fonts, in `index.html`): Inter (body), Space Grotesk (headings), JetBrains Mono (labels).
- i18n is custom and signal-based (`core/i18n.ts` + `core/i18n.service.ts`), not `@angular/localize`, so a single
  build serves both languages and switching doesn't need separate deployments.

## File map

```
vercel.json                  "/" language redirects (cookie / Accept-Language) + SPA fallback rewrite
src/
  index.html                 meta/OG tags, icons, fonts, inline theme script (prevents dark/light flash)
  styles.css                 DESIGN TOKENS (colors, fonts, radius), base styles, .btn/.chip/.card,
                             .enter / .reveal animations, view-transition CSS, reduced-motion rules
  favicon.svg                source icon ("JA" strokes on the brand gradient). The .ico/.png files are rendered from it
  favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest
  assets/CV.json             <- ENGLISH CV CONTENT
  assets/CV.pt.json          <- PORTUGUESE CV CONTENT (same structure, pt-PT)
  assets/pic.jpg             profile photo
  main.ts                    browser entry: Vercel Analytics inject() + bootstrap
  app/
    app.config.ts            providers (router, http, hydration)
    app.config.server.ts     server providers
    app.routes.ts            pages(lang) route groups for '' (en) and 'pt', language guard, legacy redirects
    app.component.*          shell: skip link, navbar, <main>, router-outlet, footer
    core/
      i18n.ts                UI STRINGS for en + pt (pt is type-checked against en)
      i18n.service.ts        current language signal, t() strings, cv() content, link(), localize/unlocalize
      cv.model.ts            TypeScript interfaces for the CV JSON
      cv.data.ts             CV_EN / CV_PT typed constants (the compiler validates the JSON) + yearsOfExperience(), summary()
      date.utils.ts          YYYY-MM parsing, localized month/range/duration formatting, timeAgo
      github.service.ts      GitHub repos (signal state, sessionStorage cache, filtering) + LANGUAGE_COLORS
      theme.service.ts       light/dark toggle (data-theme on <html>, persisted in localStorage)
      pdf/cv-pdf.builder.ts  framework-free jsPDF layout for 'cv' and 'resume', localized labels
      pdf/pdf-download.service.ts  lazy-loads jsPDF + builder, triggers download, busy/failed signals
    shared/
      reveal.directive.ts    [appReveal] / appReveal="right": IntersectionObserver slide-in from the side
      download-menu/         "Download CV" button + menu (Resume / Full CV)
    layout/navbar            links, EN/PT switch, theme toggle, download menu, mobile menu
    layout/footer
    pages/home, pages/projects, pages/contact, pages/not-found
```

## Editing the CV content

Edit `src/assets/CV.json` (English) **and** `src/assets/CV.pt.json` (Portuguese). The pages and PDFs update automatically.

- Keep both files structurally identical: same roles in the same order, same number of highlights, same tools
  and levels. A unit test (`core/cv.spec.ts`) fails if they drift apart. Only the human-readable text differs.
- Dates are `"YYYY-MM"`; `"end": null` means *Present* (shown as "Current" / "Atual").
- `basics.summary` may contain `{{years}}`, replaced with whole years since `basics.careerStart` (`"2018-08"`).
  It is also used for the "years of experience" stat in the hero. Don't hard-code the number.
- `experience[].internship: true` hides the role from the one-page resume.
- `experience[].highlights` are bullet points (keep them to one sentence each). `tools` render as chips.
- `skills.top` → progress bars (`level` 1–10); `skills.groups` → chip groups and PDF skills table; `skills.soft` → "Strengths".
- `basics.profiles[].icon` is a Bootstrap Icons name without the `bi-` prefix (`linkedin`, `github`, …).
- `github.username` / `github.includeForks` / `github.exclude` control the Projects page (read from the English file).
- Adding or renaming a field? Update `core/cv.model.ts` too. `cv.data.ts` assigns both JSON files to the `Cv`
  type, so mismatches fail the build.
- Portuguese text is **European Portuguese** (pt-PT): "equipa", "utilizador", "descarregar", "contacto", "ecrã".

## Features and how they work

### Languages (`core/i18n.ts`, `core/i18n.service.ts`, `app.routes.ts`)
- English pages live at the root (`/home`, `/projects`, `/contact`) and Portuguese pages under `/pt/…`. Both sets
  are prerendered, so each URL serves fully translated HTML with the right `<html lang>`, `<title>` and meta description.
- `app.routes.ts` builds the same page routes twice (`pages('en')`, `pages('pt')`). A `canActivate` guard on each
  group calls `I18nService.setLang()` before anything renders, on the server and in the browser.
- Page components read the language **once** at construction (`i18n.t()`, `i18n.cv()`). That's safe because
  switching language navigates to a different route group, which re-creates the page. Persistent components
  (navbar, footer, download menu) read the signals in their templates instead.
- In templates, build internal links with `[routerLink]="i18n.link('/projects')"`. Never hard-code `/home`.
- The navbar's EN/PT switch links to the same page in the other language and remembers the choice (localStorage +
  a `lang` cookie).
- Landing on `/` picks a language. On Vercel, `vercel.json` redirects at the edge: the `lang` cookie wins,
  otherwise a Portuguese `Accept-Language` goes to `/pt/home`, otherwise the prerendered `/` redirects to `/home`.
  During client-side navigation to `/`, the router's `redirectTo` function does the same with localStorage/`navigator.language`.
- Adding a UI string: add it to `en` in `core/i18n.ts`. The build then fails until `pt` has it too.

### PDF export (`core/pdf/`)
- `buildCvPdf(jsPDF, cv, variant, lang)` draws text with jsPDF's built-in **Helvetica**, so the output is real,
  selectable, ATS-friendly text (not a screenshot of the page). Section labels and dates follow `lang`.
  - `cv`: everything (all roles + tools, education highlights, skills + languages, strengths). 2 pages, with page numbers.
  - `resume`: no internships, tools or strengths. It tries 3 → 2 → 1 → 0 highlights per role until it fits on **one page**.
- File names: `Joao-Alexandre-CV.pdf`, `Joao-Alexandre-Resume.pdf`, `Joao-Alexandre-CV-PT.pdf`, `Joao-Alexandre-CV-Resumido.pdf`.
- `PdfDownloadService` dynamically imports `jspdf` and the builder, so neither is in the initial bundle.
- Helvetica uses WinAnsi encoding: Latin-1 accents (ã, é, ç, õ) and the en dash work, but emoji/CJK etc. will not.
  Embed a TTF font if that is ever needed.
- The builder is framework-free on purpose: you can bundle it with esbuild and run it in Node to preview PDFs
  (alias `jspdf` to `node_modules/jspdf/dist/jspdf.node.min.js`). Adding content can push the full CV to a 3rd
  page, so regenerate and check after edits.

### GitHub projects (`core/github.service.ts`)
- `GET https://api.github.com/users/{username}/repos?per_page=100&sort=pushed`, **browser only** (skipped
  during prerender via `isPlatformBrowser`).
- Anonymous GitHub API limit is 60 requests/hour per visitor IP; results are cached in `sessionStorage` for 15 minutes.
  Errors are returned as a reason (`rateLimit` / `failed`) and translated by the page, with retry and profile links.
- Forks are hidden unless `includeForks` is true. Repos are sorted by last push. A repo's `homepage` shows a "Live demo" link.
- Repo descriptions come from GitHub as-is (not translated).

### Theme
- Tokens are in `styles.css` `:root`, overridden for dark under `[data-theme="dark"]` and under
  `prefers-color-scheme: dark` when no explicit light theme is set.
- `index.html` sets `data-theme` before first paint. `ThemeService.toggle()` flips and persists it.
- The navbar renders both sun and moon icons and CSS chooses one, so server and client markup match (hydration-safe).

### Motion
- `.enter` (+ `style="--i: n"` for stagger): fade-up entrance on page load (hero, page headers).
- `[appReveal]`: slides in **from the left** when scrolled into view; `appReveal="right"` slides in from the right.
  The convention is section headings from the left and content from the right; timeline cards alternate.
  It's implemented as a CSS animation on the individual `translate` property, so it never conflicts with
  components' hover `transform`s or `transition` declarations. `main` has `overflow-x: clip` so off-screen
  elements can't cause horizontal scroll.
- Experience timeline: the line is drawn as one segment per item (dot → next dot), so it starts at the first
  dot and ends at the last. The dots and line stay still; only dates and cards slide.
- Animated elements become stacking contexts. `styles.css` lifts any `.enter`/`.reveal` that contains an
  `app-download-menu` (z-index 20), so later siblings can't cover the open menu.
- Route changes: View Transitions cross-fade. The navbar has `view-transition-name: site-header`, so it stays put.
- `prefers-reduced-motion: reduce` disables all of the above.

### Icons
- `src/favicon.svg` is the source (vector "JA", no font dependency). `favicon.ico` (16/32/48),
  `apple-touch-icon.png` (180) and `icon-192/512.png` (full-bleed, for the web manifest) were rendered from it with
  headless Chrome. If you change the SVG, re-render them. They are listed in `angular.json` → `assets`.

## Conventions

- Standalone components with `templateUrl` + `styleUrl`. Use signals for state. Use `host: {}` metadata instead of
  `@HostListener`/`@HostBinding`. Use `inject()` instead of constructor injection.
- **No hard-coded user-facing text in templates.** Put it in `core/i18n.ts` (UI) or the CV JSON files (content).
- **SSR-safe code**: no `window`/`document`/`localStorage` at construction time in code that also runs on
  the server. Use `afterNextRender`, `isPlatformBrowser`, or event handlers (which only run in the browser).
  Rendering must match between server and client (hydration). Prefer CSS over `@if` for client-only differences.
- Colors/spacing come from CSS variables in `styles.css`. Don't hard-code hex values in component CSS
  (exceptions: the GitHub language colors and the PDF palette).
- Icons: `<i class="bi bi-NAME" aria-hidden="true"></i>`. Give icon-only buttons an `aria-label`.
- Keep the initial bundle small: lazy-load heavy libraries (`import()`) and non-home routes (`loadComponent`).

## Deployment

- **Vercel** project `joao-alexandres-projects/cv-parser`. Every push to `master` deploys to production at
  https://cv-parser-joao-alexandres-projects.vercel.app. Vercel runs `ng build` and serves the prerendered static output.
  - The old alias `cv-parser-nu.vercel.app` (still set as the GitHub repo "homepage") returns `DEPLOYMENT_NOT_FOUND`.
- `vercel.json`:
  - `redirects`: language choice for `/` (see *Languages*). These run before static files.
  - `rewrites`: every path that isn't a static file goes to `/index.csr.html`, so non-prerendered URLs (`/about`,
    `/pt/portfolio`, typos) boot the app and the Angular router handles redirects and the 404 page.

### Analytics
- `src/main.ts` calls `inject()` from `@vercel/analytics` (the framework-agnostic API; there is no Angular-specific
  package). It runs in the browser only. Client-side navigations are tracked automatically because the script hooks
  `history.pushState`. In dev mode (`ng serve`) it only logs to the console.
- `PdfDownloadService` sends a custom event `PDF Download` with `{ variant, lang }`. Custom events only show up on
  Vercel plans that include them; page views work on every plan.
- Analytics must be enabled in the Vercel dashboard (Project → Analytics). `/_vercel/insights/script.js` only
  exists on Vercel, so expect a 404 for it when serving `dist/` locally.

### CI leftovers
- `.github/workflows/jekyll-gh-pages.yml` and `static.yml` are **leftovers** from a GitHub Pages setup (the Jekyll
  one runs on every push to `master` and builds the raw repo, not the Angular app). There is no `gh-pages` branch,
  and `angular-cli-ghpages` is unused for the same reason. They can probably be deleted. Confirm the Pages settings first.

## Dependencies and security

- Keep Angular packages on the same minor version (currently 22.2.x). Update with `npm update --save` and then
  `npm audit fix`. `package.json` `overrides` pins minimum safe versions of `uuid` and `qs` for transitive deps.
- Last audit (Nov 2026): 0 vulnerabilities after updating to Angular 22.2.6 and running `npm audit fix`
  (fixed `source-map-js`, `vite`, `zod`, `proxy-addr`, `shell-quote`, `serialize-javascript`, `webpack-dev-middleware`, `qs`, …).
  Almost all of these were build/dev-server tooling and never shipped to visitors.
- Majors held back on purpose: TypeScript 7 (not yet supported by Angular 22) and `@types/node` > 22.

## Known issues / gotchas

- `server.ts` (the Express SSR server for `npm run serve:ssr:CVParser`) **does not start**. It fails with
  "Angular app engine manifest is not set", and its `'*'` routes are also invalid in Express 5. This predates
  the redesign. The site doesn't need it because pages are prerendered. To fix it, regenerate it from the
  current `@angular/ssr` template (`AngularNodeAppEngine`, `createNodeRequestHandler`, `/{*splat}` routes).
- `angular.json` test polyfills deliberately omit `zone.js/testing`, because it breaks with jasmine-core 7
  ("Cannot assign to read only property 'describe'"). Specs therefore can't use `fakeAsync`/`waitForAsync`.
- `allowedCommonJsDependencies` lists jsPDF's optional dependencies. They are only loaded in the lazy PDF chunk.
- `src/assets/pics/background.png` is no longer used (the old hero background).
- On Windows, headless Chrome's `--window-size` has a minimum width. To check mobile layouts, use device
  emulation (DevTools / CDP `Emulation.setDeviceMetricsOverride`) rather than a narrow window.
