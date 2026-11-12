import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { CV } from '../../core/cv.data';
import { ThemeService } from '../../core/theme.service';
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
  protected readonly name = CV.basics.name;
  protected readonly initials = CV.basics.name
    .split(/\s+/)
    .map(p => p[0])
    .join('')
    .slice(0, 2);

  protected readonly links = [
    { path: '/home', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/contact', label: 'Contact' },
  ];

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  constructor() {
    inject(Router)
      .events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.menuOpen.set(false));
  }
}
