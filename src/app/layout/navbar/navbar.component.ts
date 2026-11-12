import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ThemeService } from '../../core/theme.service';
import { I18nService, localize, unlocalize } from '../../core/i18n.service';
import { LANGS, Lang } from '../../core/i18n';
import { DownloadMenuComponent } from '../../shared/download-menu/download-menu.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, DownloadMenuComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  host: {
    '(window:scroll)': 'onScroll()',
    '[class.scrolled]': 'scrolled()',
  },
})
export class NavbarComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(I18nService);
  private readonly router = inject(Router);

  protected readonly name = this.i18n.cv().basics.name;
  protected readonly initials = this.name
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .slice(0, 2);

  protected readonly links = computed(() => {
    const t = this.i18n.t().nav;
    return [
      { path: this.i18n.link('/home'), label: t.home },
      { path: this.i18n.link('/projects'), label: t.projects },
      { path: this.i18n.link('/contact'), label: t.contact },
    ];
  });

  /** Current path without language prefix, to build the EN/PT switch links. */
  private readonly path = signal(unlocalize(this.router.url));
  protected readonly languages = computed(() =>
    LANGS.map(lang => ({ lang, url: localize(this.path(), lang), active: lang === this.i18n.lang() })),
  );

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  chooseLanguage(lang: Lang): void {
    this.i18n.remember(lang);
  }

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(e => {
      this.menuOpen.set(false);
      this.path.set(unlocalize(e.urlAfterRedirects));
    });
  }
}
