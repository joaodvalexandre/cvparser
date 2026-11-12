import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

/**
 * Light/dark theme. The initial value is applied before Angular boots by an inline
 * script in `index.html` (no flash); this service only reads and toggles it.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly theme = signal<Theme>(this.initial());

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    this.doc.documentElement.dataset['theme'] = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable */
    }
  }

  private initial(): Theme {
    if (!this.isBrowser) return 'light';
    const fromDom = this.doc.documentElement.dataset['theme'];
    if (fromDom === 'light' || fromDom === 'dark') return fromDom;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
