import { jsPDF } from 'jspdf';
import { CV, summary, yearsOfExperience } from './cv.data';
import { selectRepos } from './github.service';
import { buildCvPdf, pdfFileName } from './pdf/cv-pdf.builder';

describe('CV data', () => {
  const now = new Date('2026-11-12');

  it('computes years of experience excluding internships', () => {
    expect(yearsOfExperience(CV, now)).toBe(7);
    expect(summary(CV, now)).toContain('7+ years');
    expect(summary(CV, now)).not.toContain('{{');
  });

  it('uses YYYY-MM dates everywhere', () => {
    const dates = [...CV.experience, ...CV.education].flatMap(e => [e.start, e.end]).filter(Boolean);
    dates.forEach(d => expect(d).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/));
  });
});

describe('PDF builder', () => {
  it('fits the resume on one page and names files without accents', () => {
    expect(buildCvPdf(jsPDF, CV, 'resume').getNumberOfPages()).toBe(1);
    expect(buildCvPdf(jsPDF, CV, 'cv').getNumberOfPages()).toBeGreaterThanOrEqual(1);
    expect(pdfFileName(CV, 'resume')).toBe('Joao-Alexandre-Resume.pdf');
  });
});

describe('selectRepos', () => {
  const repo = (name: string, extra: object = {}) => ({
    name,
    html_url: `https://github.com/x/${name}`,
    description: null,
    language: 'PHP',
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    archived: false,
    homepage: '',
    pushed_at: '2026-01-01T00:00:00Z',
    ...extra,
  });

  it('drops forks and excluded repos, sorts by last push', () => {
    const out = selectRepos(
      [repo('old', { pushed_at: '2020-01-01T00:00:00Z' }), repo('forked', { fork: true }), repo('Hidden'), repo('new')],
      { username: 'x', includeForks: false, exclude: ['hidden'] },
    );
    expect(out.map(r => r.name)).toEqual(['new', 'old']);
    expect(out[0].homepage).toBeNull();
  });
});
