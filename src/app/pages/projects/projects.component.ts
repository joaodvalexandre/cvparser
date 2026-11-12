import { Component, computed, inject, signal } from '@angular/core';
import { GithubService, LANGUAGE_COLORS, Repo } from '../../core/github.service';
import { timeAgo } from '../../core/date.utils';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-projects',
  imports: [RevealDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent {
  protected readonly github = inject(GithubService);
  protected readonly filter = signal<string>('All');
  protected readonly skeletons = Array.from({ length: 6 }, (_, i) => i);

  protected readonly repos = computed<Repo[]>(() => {
    const s = this.github.state();
    return s.status === 'ready' ? s.repos : [];
  });

  protected readonly errorMessage = computed(() => {
    const s = this.github.state();
    return s.status === 'error' ? s.message : '';
  });

  /** Languages present, most common first. */
  protected readonly languages = computed(() => {
    const counts = new Map<string, number>();
    for (const r of this.repos()) {
      if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    }
    return ['All', ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([l]) => l)];
  });

  protected readonly visible = computed(() => {
    const f = this.filter();
    return f === 'All' ? this.repos() : this.repos().filter(r => r.language === f);
  });

  constructor() {
    this.github.load();
  }

  protected color(language: string | null): string {
    return (language && LANGUAGE_COLORS[language]) || 'var(--muted)';
  }

  protected ago(iso: string): string {
    return timeAgo(iso);
  }

  /** Turns `mksm-ps2-recomp` into `Mksm ps2 recomp` for a friendlier title. */
  protected title(name: string): string {
    const spaced = name.replace(/[-_]+/g, ' ');
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }
}
