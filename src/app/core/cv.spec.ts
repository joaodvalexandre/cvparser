import { jsPDF } from 'jspdf';
import { CV, CV_EN, CV_PT, summary, yearsOfExperience } from './cv.data';
import { selectRepos } from './github.service';
import { buildCvPdf, pdfFileName } from './pdf/cv-pdf.builder';
import { localize, unlocalize } from './i18n.service';

describe('CV data', () => {
  const now = new Date('2026-11-12');

  it('counts whole years since careerStart', () => {
    expect(yearsOfExperience(CV, now)).toBe(8);
    expect(yearsOfExperience(CV, new Date('2026-07-15'))).toBe(7); // ticks over in August
    expect(summary(CV_EN, now)).toContain('8+ years');
    expect(summary(CV_PT, now)).toContain('mais de 8 anos');
    expect(summary(CV_PT, now)).not.toContain('{{');
  });

  it('uses YYYY-MM dates everywhere', () => {
    const dates = [...CV.experience, ...CV.education].flatMap(e => [e.start, e.end]).filter(Boolean);
    dates.forEach(d => expect(d).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/));
  });

  it('keeps the Portuguese CV in sync with the English one', () => {
    const shape = (cv: typeof CV) => ({
      careerStart: cv.basics.careerStart,
      email: cv.basics.email,
      top: cv.skills.top.map(s => s.level),
      groups: cv.skills.groups.map(g => g.items.length),
      soft: cv.skills.soft.length,
      languages: cv.languages.length,
      experience: cv.experience.map(e => [e.company, e.start, e.end, !!e.internship, e.highlights.length, e.tools.join()]),
      education: cv.education.map(e => [e.start, e.end, e.grade, e.highlights.length]),
    });
    expect(shape(CV_PT)).toEqual(shape(CV_EN));
  });
});

describe('PDF builder', () => {
  it('fits the resume on one page in both languages', () => {
    expect(buildCvPdf(jsPDF, CV_EN, 'resume', 'en').getNumberOfPages()).toBe(1);
    expect(buildCvPdf(jsPDF, CV_PT, 'resume', 'pt').getNumberOfPages()).toBe(1);
    expect(buildCvPdf(jsPDF, CV_PT, 'cv', 'pt').getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('names files without accents, per language', () => {
    expect(pdfFileName(CV_EN, 'resume', 'en')).toBe('Joao-Alexandre-Resume.pdf');
    expect(pdfFileName(CV_EN, 'cv', 'en')).toBe('Joao-Alexandre-CV.pdf');
    expect(pdfFileName(CV_PT, 'resume', 'pt')).toBe('Joao-Alexandre-CV-Resumido.pdf');
    expect(pdfFileName(CV_PT, 'cv', 'pt')).toBe('Joao-Alexandre-CV-PT.pdf');
  });
});

describe('language URLs', () => {
  it('strips and adds the /pt prefix', () => {
    expect(unlocalize('/pt/projects#x')).toBe('/projects');
    expect(unlocalize('/pt')).toBe('/home');
    expect(unlocalize('/contact?a=1')).toBe('/contact');
    expect(unlocalize('/')).toBe('/home');
    expect(localize('/home', 'pt')).toBe('/pt/home');
    expect(localize('/home', 'en')).toBe('/home');
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
