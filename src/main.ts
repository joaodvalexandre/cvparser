import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { inject as injectAnalytics } from '@vercel/analytics';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Browser-only entry (the server uses main.server.ts), so this never runs during prerender.
// Page views on client-side navigation are tracked automatically (pushState).
// In dev mode the script only logs to the console and sends nothing.
injectAnalytics({ mode: isDevMode() ? 'development' : 'production' });

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
