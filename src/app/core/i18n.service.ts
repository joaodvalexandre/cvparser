import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { CVS } from './cv.data';
import { Lang, STRINGS } from './i18n';

const STORAGE_KEY = 'lang';

/**
 * Current language. It is driven by the URL: English pages live at `/home`, `/projects`, …
 * and Portuguese pages under `/pt/…`. The route guard in `app.routes.ts` calls `setLang()`
 * before any page renders (on the server during prerender too), so markup always matches the URL.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly doc = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly lang = signal<Lang>('en');
  /** UI strings for the current language. */
  readonly t = computed(() => STRINGS[this.lang()]);
  /** CV content for the current language. */
  readonly cv = computed(() => CVS[this.lang()]);

  setLang(lang: Lang): void {
    this.lang.set(lang);
    this.doc.documentElement.lang = STRINGS[lang].locale;
    this.meta.updateTag({ name: 'description', content: STRINGS[lang].meta.description });
  }

  /** Prefixes an app path with the current language (`/home` -> `/pt/home`). */
  link(path: string): string {
    return localize(path, this.lang());
  }

  /**
   * Remembers an explicit language choice for when the visitor next lands on `/`.
   * The cookie is read by the redirects in `vercel.json` (edge); localStorage by the client-side `''` route.
   */
  remember(lang: Lang): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      this.doc.cookie = `${STORAGE_KEY}=${lang}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* storage unavailable */
    }
  }

  /** Saved choice, else the browser language. Always `en` on the server. */
  preferred(): Lang {
    if (!this.isBrowser) return 'en';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'pt') return saved;
    } catch {
      /* storage unavailable */
    }
    return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  }
}

/** Strips any language prefix from a URL path: `/pt/projects#x` -> `/projects`. */
export function unlocalize(url: string): string {
  const path = url.split(/[?#]/)[0].replace(/^\/pt(?=\/|$)/, '');
  return path === '' || path === '/' ? '/home' : path;
}

/** Adds the language prefix to an unprefixed app path. */
export function localize(path: string, lang: Lang): string {
  return lang === 'pt' ? `/pt${path}` : path;
}
