# CVParser

My personal CV and portfolio site, built with Angular 22. All content is driven by a single JSON file.

**Live:** https://cv-parser-joao-alexandres-projects.vercel.app

## Features

- CV page with an experience timeline, skills and education, all generated from [`src/assets/CV.json`](src/assets/CV.json)
- **Download as PDF**: a one-page resume or the full CV, generated in the browser
- **Projects** pulled live from my public GitHub repositories (language, description, stars, links)
- Light / dark theme, scroll and route animations (respects reduced-motion), responsive down to small phones
- Prerendered for fast first load and SEO, with Vercel Analytics

## Getting started

```sh
npm install
npm start          # http://localhost:4200
npm run build      # production build -> dist/cvparser/browser
npx ng test --watch=false --browsers=ChromeHeadless
```

## Updating the CV

Edit `src/assets/CV.json`. The site and both PDFs update automatically. See [AGENTS.md](AGENTS.md) for the
field reference, architecture and conventions.
