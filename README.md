# CVParser

My personal CV and portfolio website, in **English and Portuguese**, built with **Angular 22** and driven entirely
by JSON. The site also generates a downloadable PDF CV and pulls my latest public GitHub projects.

**Live:** https://cv-parser-joao-alexandres-projects.vercel.app · 🇵🇹 [/pt/home](https://cv-parser-joao-alexandres-projects.vercel.app/pt/home)

## Features

| | |
| --- | --- |
| 📄 **CV from JSON** | Experience timeline, skills, strengths and education, all generated from [`CV.json`](src/assets/CV.json) / [`CV.pt.json`](src/assets/CV.pt.json). Years of experience are calculated automatically. |
| ⬇️ **PDF download** | Visitors can download a **one-page resume** or the **full CV** as a real-text PDF, generated in their browser in the language they're reading. |
| 🐙 **GitHub projects** | The Projects page lists my public repositories live from the GitHub API: language, description, topics, stars and links. |
| 🌍 **Bilingual** | English at `/…`, European Portuguese at `/pt/…`. Both are prerendered for SEO; the switch remembers your choice. |
| 🌗 **Light / dark theme** | Follows the system setting, with a toggle that remembers your choice. |
| ✨ **Motion** | Hero entrance, sections that slide in from the sides, animated skill bars and smooth page transitions. All of it turns off when "reduce motion" is enabled. |
| 📱 **Responsive** | Works from small phones up to wide screens. |
| 📊 **Analytics** | Vercel Analytics for page views (and PDF downloads). |

## Tech stack

- [Angular 22](https://angular.dev): standalone components, signals, SSR and build-time prerendering with hydration
- [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF generation (lazy-loaded)
- [Bootstrap Icons](https://icons.getbootstrap.com), plain CSS with design tokens (no UI framework)
- [Vercel](https://vercel.com) hosting and [Vercel Analytics](https://vercel.com/docs/analytics)
- Karma + Jasmine unit tests

## Getting started

Requirements: Node.js 20+ and npm.

```sh
git clone https://github.com/joaodvalexandre/CVParser.git
cd CVParser
npm install
npm start            # dev server at http://localhost:4200
```

| Command | What it does |
| --- | --- |
| `npm start` | Development server with live reload |
| `npm run build` | Production build + prerender to `dist/cvparser/browser` |
| `npx ng test --watch=false --browsers=ChromeHeadless` | Run unit tests |
| `npm audit` | Check dependencies for known vulnerabilities |

## Updating the CV

1. Edit [`src/assets/CV.json`](src/assets/CV.json) (English) and [`src/assets/CV.pt.json`](src/assets/CV.pt.json) (Portuguese).
   Keep both files in the same structure; only the text differs (a test checks this).
2. Dates use `YYYY-MM`; set `"end": null` for your current role.
3. Use `{{years}}` in the summary to insert the years of experience since `careerStart`.
4. Run `npm run build` (or `npm start`) to see the result. The PDFs pick up the changes automatically.

UI labels (buttons, headings, etc.) live in [`src/app/core/i18n.ts`](src/app/core/i18n.ts).

## Project structure

```
src/
├── assets/CV.json, CV.pt.json   ← CV content (EN / PT)
├── styles.css                   ← design tokens, shared components, animations
└── app/
    ├── core/                    ← data, i18n, GitHub, theme, PDF generation
    ├── shared/                  ← reveal directive, download menu
    ├── layout/                  ← navbar, footer
    └── pages/                   ← home, projects, contact, 404
```

## Deployment

Every push to `master` deploys automatically to Vercel. `vercel.json` handles the language redirect on `/` and
the fallback for client-side routes.

## For contributors and AI assistants

See **[AGENTS.md](AGENTS.md)** for the full architecture, conventions, how each feature works, and known issues.

## License

[MIT](LICENSE)
