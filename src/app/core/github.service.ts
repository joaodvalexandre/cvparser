import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { CV } from './cv.data';

/** Subset of the GitHub REST `GET /users/{user}/repos` response we use. */
interface GithubRepoResponse {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  homepage: string | null;
  topics?: string[];
  pushed_at: string;
}

export interface Repo {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  homepage: string | null;
  topics: string[];
  pushedAt: string;
  archived: boolean;
}

type State =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; repos: Repo[] }
  | { status: 'error'; reason: 'rateLimit' | 'failed' };

const CACHE_KEY = 'gh-repos-v1';
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Loads public repositories for `CV.github.username`, client-side only (never during prerender),
 * with a 15-minute sessionStorage cache to stay well under GitHub's 60 req/hour anonymous limit.
 */
@Injectable({ providedIn: 'root' })
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly state = signal<State>({ status: 'idle' });
  readonly profileUrl = `https://github.com/${CV.github.username}`;

  async load(force = false): Promise<void> {
    if (!this.isBrowser) return;
    const current = this.state().status;
    if (!force && (current === 'loading' || current === 'ready')) return;

    if (!force) {
      const cached = readCache();
      if (cached) {
        this.state.set({ status: 'ready', repos: cached });
        return;
      }
    }

    this.state.set({ status: 'loading' });
    try {
      const url = `https://api.github.com/users/${encodeURIComponent(CV.github.username)}/repos?per_page=100&sort=pushed`;
      const raw = await firstValueFrom(
        this.http.get<GithubRepoResponse[]>(url, { headers: { Accept: 'application/vnd.github+json' } }),
      );
      const repos = selectRepos(raw);
      writeCache(repos);
      this.state.set({ status: 'ready', repos });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      this.state.set({ status: 'error', reason: status === 403 || status === 429 ? 'rateLimit' : 'failed' });
    }
  }
}

/** Filters (forks / excluded) and maps the API response. Exported for tests. */
export function selectRepos(raw: GithubRepoResponse[], config = CV.github): Repo[] {
  const exclude = new Set(config.exclude.map(n => n.toLowerCase()));
  return raw
    .filter(r => (config.includeForks || !r.fork) && !exclude.has(r.name.toLowerCase()))
    .map(r => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      homepage: r.homepage || null,
      topics: r.topics ?? [],
      pushedAt: r.pushed_at,
      archived: r.archived,
    }))
    .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));
}

function readCache(): Repo[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, repos } = JSON.parse(raw) as { at: number; repos: Repo[] };
    return Date.now() - at < CACHE_TTL_MS ? repos : null;
  } catch {
    return null;
  }
}

function writeCache(repos: Repo[]): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
  } catch {
    /* storage unavailable: ignore */
  }
}

/** GitHub linguist colours for the languages likely to show up. */
export const LANGUAGE_COLORS: Record<string, string> = {
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  CSS: '#563d7c',
  Dart: '#00B4AB',
  Go: '#00ADD8',
  HTML: '#e34c26',
  Java: '#b07219',
  JavaScript: '#f1e05a',
  Kotlin: '#A97BFF',
  PHP: '#4F5D95',
  Python: '#3572A5',
  Rust: '#dea584',
  SCSS: '#c6538c',
  Shell: '#89e051',
  Blade: '#f7523f',
  TypeScript: '#3178c6',
  Vue: '#41b883',
};
