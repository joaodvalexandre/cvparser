# CVParser: project context

Context for AI coding assistants (Claude, Copilot, Cursor, Codex, …) and humans. `CLAUDE.md` imports this file.
Keep it up to date when you change architecture, commands or conventions.

## What this is

A personal CV / portfolio website for **João Alexandre** (Full-Stack PHP Developer), built with **Angular 22**.
All content comes from one JSON file (`src/assets/CV.json`). Visitors can:

- read the CV (home page: hero, about, skills, experience timeline, education),
- browse public GitHub repositories (Projects page, fetched live from the GitHub API),
- download a **one-page resume** or a **full CV** as PDF (generated in the browser),
- get in touch (Contact page, with copy-to-clipboard for email and phone).

Live site: https://cv-parser-joao-alexandres-projects.vercel.app (Vercel; see *Deployment*).

## Commands

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Dev server (http://localhost:4200) | `npm start` (`ng serve`) |
| Production build + prerender | `npm run build` → `dist/cvparser/browser/` |
| Unit tests (Karma + Jasmine) | `npx ng test --watch=false --browsers=ChromeHeadless` |

On Windows, if Karma can't find Chrome, set `CHROME_BIN="C:/Program Files/Google/Chrome/Application/chrome.exe"`.

## Stack

- Angular 22: standalone components, signals, `@if`/`@for` control flow, `input()`, `viewChild()`. No NgModules.
- SSR + build-time **prerendering** of `/home`, `/projects`, `/contact`, `/404` with **client hydration** (`provideClientHydration(withEventReplay())`).
- Router: `withViewTransitions()` (route animations through the View Transitions API) and `withInMemoryScrolling` (scroll to top, anchor support).
- `HttpClient` with `withFetch()`.
- **jsPDF** (lazy-loaded) for PDFs. **@vercel/analytics** (`inject()` in `main.ts`). **bootstrap-icons** (icon font, imported once in `styles.css`).
- Plain CSS with design tokens. No Bootstrap/Tailwind/Material.
- Fonts (Google Fonts, in `index.html`): Inter (body), Space Grotesk (headings), JetBrains Mono (labels).

## File map

```
src/
  index.html                 meta/OG tags, fonts, inline theme script (prevents dark/light flash)
  styles.css                 DESIGN TOKENS (colors, fonts, radius), base styles, .btn/.chip/.card,
                             .reveal/.enter animations, view-transition CSS, reduced-motion rules
  assets/CV.json             <- ALL CV CONTENT LIVES HERE
  assets/pic.jpg             profile photo
  app/
    app.config.ts            providers (router, http, hydration)
    app.config.server.ts     server providers
    app.routes.ts            routes + legacy redirects (/portfolio, /contacts, /about)
    app.component.*          shell: skip link, navbar, <main>, router-outlet, footer
    core/
      cv.model.ts            TypeScript interfaces for CV.json
      cv.data.ts             `CV` typed constant (the compiler validates the JSON) + yearsOfExperience(), summary()
      date.utils.ts          YYYY-MM parsing/formatting, durations, timeAgo
      github.service.ts      GitHub repos (signal state, sessionStorage cache, filtering) + LANGUAGE_COLORS
      theme.service.ts       light/dark toggle (data-theme on <html>, persisted in localStorage)
      pdf/cv-pdf.builder.ts  framework-free jsPDF layout for 'cv' and 'resume'
      pdf/pdf-download.service.ts  lazy-loads jsPDF + builder, triggers download, busy/error signals
    shared/
      reveal.directive.ts    [appReveal]: IntersectionObserver scroll-reveal
      download-menu/         "Download CV" button + menu (Resume / Full CV)
    layout/navbar, layout/footer
    pages/home, pages/projects, pages/contact, pages/not-found
```

## Editing the CV content

Edit **only** `src/assets/CV.json`. The pages and both PDFs update automatically.

- Dates are `"YYYY-MM"`; `"end": null` means *Present* (the role is shown as "Current").
- `basics.summary` may contain `{{years}}`, replaced with whole years since `basics.careerStart` (`"2018-08"`).
  It is also used for the "years of experience" stat in the hero. Don't hard-code the number.
- `experience[].internship: true` hides the role from the one-page resume.
- `experience[].highlights` are bullet points (keep them to one sentence each). `tools` render as chips.
- `skills.top` → progress bars (`level` 1–10); `skills.groups` → chip groups and PDF skills table; `skills.soft` → "Strengths".
- `basics.profiles[].icon` is a Bootstrap Icons name without the `bi-` prefix (`linkedin`, `github`, …).
- `github.username` / `github.includeForks` / `github.exclude` control the Projects page.
- Adding or renaming a field? Update `core/cv.model.ts` too. `cv.data.ts` assigns the JSON to a `Cv` type,
  so mismatches fail the build.

## Features and how they work

### PDF export (`core/pdf/`)
- `buildCvPdf(jsPDF, cv, variant)` draws text with jsPDF's built-in **Helvetica**, so the output is real,
  selectable, ATS-friendly text (not a screenshot of the page).
  - `cv`: everything (all roles + tools, education highlights, skills, strengths, languages). About 2 pages, with page numbers.
  - `resume`: no internships, tools or strengths. It tries 3 → 2 → 1 → 0 highlights per role until it fits on **one page**.
- `PdfDownloadService` dynamically imports `jspdf` and the builder, so neither is in the initial bundle.
- Helvetica uses WinAnsi encoding: Latin-1 accents (ã, é, ç) and the en dash work, but emoji/CJK etc. will not.
  Embed a TTF font if that is ever needed.
- The builder is framework-free on purpose: you can bundle it with esbuild and run it in Node to preview PDFs
  (alias `jspdf` to `node_modules/jspdf/dist/jspdf.node.min.js`).

### GitHub projects (`core/github.service.ts`)
- `GET https://api.github.com/users/{username}/repos?per_page=100&sort=pushed`, **browser only** (skipped
  during prerender via `isPlatformBrowser`).
- Anonymous GitHub API limit is 60 requests/hour per visitor IP; results are cached in `sessionStorage` for 15 minutes.
  403/429 shows a friendly "rate limit" message with a retry button and a link to the profile.
- Forks are hidden unless `includeForks` is true. Repos are sorted by last push. A repo's `homepage` shows a "Live demo" link.
- Repo cards show language (colored dot from `LANGUAGE_COLORS`), description, topics, stars, forks and when they were last updated.

### Theme
- Tokens are in `styles.css` `:root`, overridden for dark under `[data-theme="dark"]` and under
  `prefers-color-scheme: dark` when no explicit light theme is set.
- `index.html` sets `data-theme` before first paint. `ThemeService.toggle()` flips and persists it.
- The navbar renders both sun and moon icons and CSS chooses one, so server and client markup match (hydration-safe).

### Motion
- `.enter` (+ `style="--i: n"` for stagger): entrance animation on page load.
- `[appReveal]`: fade/slide in when scrolled into view. Skill bars fill when their card is revealed.
- Route changes: View Transitions cross-fade. The navbar has `view-transition-name: site-header`, so it stays put.
- `prefers-reduced-motion: reduce` disables all of the above.

## Conventions

- Standalone components with `templateUrl` + `styleUrl`. Use signals for state. Use `host: {}` metadata instead of
  `@HostListener`/`@HostBinding`. Use `inject()` instead of constructor injection.
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
- `vercel.json` rewrites every path that isn't a static file to `/index.csr.html`, so non-prerendered URLs
  (`/about`, `/portfolio`, typos) boot the app and the Angular router handles redirects and the 404 page.
  Static files and prerendered pages take priority over the rewrite.

### Analytics
- `src/main.ts` calls `inject()` from `@vercel/analytics` (the framework-agnostic API; there is no Angular-specific
  package). It runs in the browser only. Client-side navigations are tracked automatically because the script hooks
  `history.pushState`. In dev mode (`ng serve`) it only logs to the console.
- `PdfDownloadService` sends a custom event `PDF Download` with `{ variant: 'cv' | 'resume' }`. Custom events only
  show up on Vercel plans that include them; page views work on every plan.
- Analytics must be **enabled in the Vercel dashboard** (Project → Analytics); until then
  `/_vercel/insights/script.js` returns 404 and nothing is collected.
- `.github/workflows/jekyll-gh-pages.yml` and `static.yml` are **leftovers** from a GitHub Pages setup (the Jekyll
  one runs on every push to `master` and builds the raw repo, not the Angular app). There is no `gh-pages` branch.
  They can probably be deleted. Confirm the Pages settings first.

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
