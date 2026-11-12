/**
 * Shape of `src/assets/CV.json`, the single source of truth for every page and both PDFs.
 * `cv.data.ts` assigns the JSON to a `Cv`-typed constant, so a typo in the JSON fails the build.
 *
 * Dates are `YYYY-MM` strings; `end: null` means "Present".
 */
export interface Cv {
  basics: Basics;
  skills: Skills;
  languages: Language[];
  experience: Experience[];
  education: Education[];
  github: GithubConfig;
}

export interface Basics {
  name: string;
  /** Headline job title shown in the hero and PDF header. */
  label: string;
  picture: string;
  location: string;
  phone: string;
  email: string;
  /** May contain `{{years}}`, replaced with the computed years of experience. */
  summary: string;
  availability: string;
  profiles: Profile[];
}

export interface Profile {
  network: string;
  username: string;
  url: string;
  /** Bootstrap Icons name without the `bi-` prefix. */
  icon: string;
}

export interface Skills {
  /** Shown as bars on the home page. `level` is 1-10. */
  top: { name: string; level: number }[];
  groups: { name: string; items: string[] }[];
  soft: { name: string; description: string }[];
}

export interface Language {
  language: string;
  fluency: string;
}

export interface Experience {
  company: string;
  position: string;
  /** Internships are excluded from the one-page resume and from years-of-experience. */
  internship?: boolean;
  start: string;
  end: string | null;
  location: string;
  highlights: string[];
  tools: string[];
}

export interface Education {
  institution: string;
  area: string;
  studyType: string;
  start: string;
  end: string | null;
  grade?: string;
  highlights: string[];
}

export interface GithubConfig {
  username: string;
  includeForks: boolean;
  /** Repo names to hide from the Projects page. */
  exclude: string[];
}
