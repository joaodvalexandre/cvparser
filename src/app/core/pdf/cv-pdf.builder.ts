import type { jsPDF as JsPdf } from 'jspdf';
import { Cv, Experience } from '../cv.model';
import { formatRange } from '../date.utils';
import { summary } from '../cv.data';

/**
 * Framework-free PDF layout for the CV / resume, built on jsPDF's standard Helvetica font
 * (real, selectable text, so it stays ATS-friendly).
 *
 * - `cv`: full document, every role, all highlights, tools, strengths. Usually 2 pages.
 * - `resume`: one page. Drops internships, tools and soft skills, and trims highlights
 *   until everything fits on a single page.
 */
export type PdfVariant = 'cv' | 'resume';

type JsPdfCtor = typeof JsPdf;

const PAGE = { w: 210, h: 297, margin: 18 };
const CONTENT_W = PAGE.w - PAGE.margin * 2;
const COLOR = {
  text: [31, 35, 40] as const,
  muted: [89, 99, 110] as const,
  accent: [13, 130, 95] as const,
  rule: [210, 215, 220] as const,
};
/** pt -> mm line height factor */
const LH = 0.3528 * 1.35;

interface Options {
  maxHighlights: number;
  showTools: boolean;
  showInternships: boolean;
  showStrengths: boolean;
  compact: boolean;
}

export function buildCvPdf(JsPdfClass: JsPdfCtor, cv: Cv, variant: PdfVariant, now: Date = new Date()): JsPdf {
  if (variant === 'cv') {
    return render(JsPdfClass, cv, now, {
      maxHighlights: Infinity,
      showTools: true,
      showInternships: true,
      showStrengths: true,
      compact: false,
    });
  }
  // Resume: shrink until it fits on one page.
  for (const maxHighlights of [3, 2, 1, 0]) {
    const doc = render(JsPdfClass, cv, now, {
      maxHighlights,
      showTools: false,
      showInternships: false,
      showStrengths: false,
      compact: true,
    });
    if (doc.getNumberOfPages() === 1 || maxHighlights === 0) {
      return doc;
    }
  }
  throw new Error('unreachable');
}

export function pdfFileName(cv: Cv, variant: PdfVariant): string {
  const ascii = cv.basics.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
  return `${ascii}-${variant === 'cv' ? 'CV' : 'Resume'}.pdf`;
}

function render(JsPdfClass: JsPdfCtor, cv: Cv, now: Date, opt: Options): JsPdf {
  const doc = new JsPdfClass({ unit: 'mm', format: 'a4' });
  const { basics } = cv;
  let y = PAGE.margin;

  doc.setProperties({
    title: `${basics.name} – ${opt.compact ? 'Resume' : 'CV'}`,
    author: basics.name,
    subject: basics.label,
    creator: basics.name,
  });

  // ---------- primitives ----------
  const font = (size: number, style: 'normal' | 'bold' = 'normal', color: readonly number[] = COLOR.text) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
  };

  const ensure = (height: number) => {
    if (y + height > PAGE.h - PAGE.margin) {
      doc.addPage();
      y = PAGE.margin;
    }
  };

  /** Wrapped paragraph. Returns nothing; advances `y`. */
  const paragraph = (text: string, size: number, x = PAGE.margin, width = CONTENT_W, color: readonly number[] = COLOR.text, style: 'normal' | 'bold' = 'normal') => {
    font(size, style, color);
    const lines: string[] = doc.splitTextToSize(text, width);
    const lh = size * LH;
    for (const line of lines) {
      ensure(lh);
      doc.text(line, x, y + size * 0.3528);
      y += lh;
    }
  };

  const bullet = (text: string, size: number) => {
    const indent = 4;
    font(size);
    const lines: string[] = doc.splitTextToSize(text, CONTENT_W - indent);
    const lh = size * LH;
    ensure(lh);
    doc.setFillColor(COLOR.accent[0], COLOR.accent[1], COLOR.accent[2]);
    doc.circle(PAGE.margin + 1.2, y + lh * 0.5, 0.55, 'F');
    for (const line of lines) {
      ensure(lh);
      doc.text(line, PAGE.margin + indent, y + size * 0.3528);
      y += lh;
    }
  };

  const section = (title: string) => {
    const gap = opt.compact ? 3.5 : 5.5;
    ensure(gap + 12); // keep the heading with at least a line of content
    y += gap;
    font(9.5, 'bold', COLOR.accent);
    doc.setCharSpace(0.6);
    doc.text(title.toUpperCase(), PAGE.margin, y + 9.5 * 0.3528);
    doc.setCharSpace(0);
    y += 9.5 * LH + 0.6;
    doc.setDrawColor(COLOR.rule[0], COLOR.rule[1], COLOR.rule[2]);
    doc.setLineWidth(0.25);
    doc.line(PAGE.margin, y, PAGE.w - PAGE.margin, y);
    y += opt.compact ? 2.2 : 3;
  };

  /** Left text (bold) + right-aligned muted text on the same baseline. */
  const row = (left: string, right: string, size: number) => {
    font(9, 'normal', COLOR.muted);
    const rightW = doc.getTextWidth(right);
    font(size, 'bold');
    const lines: string[] = doc.splitTextToSize(left, CONTENT_W - rightW - 4);
    const lh = size * LH;
    ensure(lh * lines.length);
    lines.forEach((line, i) => doc.text(line, PAGE.margin, y + size * 0.3528 + i * lh));
    font(9, 'normal', COLOR.muted);
    doc.text(right, PAGE.w - PAGE.margin, y + size * 0.3528, { align: 'right' });
    y += lh * lines.length;
  };

  // ---------- header ----------
  font(opt.compact ? 22 : 24, 'bold');
  doc.text(basics.name, PAGE.margin, y + 7);
  y += opt.compact ? 10 : 11;
  font(12, 'normal', COLOR.accent);
  doc.text(basics.label, PAGE.margin, y + 4);
  y += 7;

  const contacts: { text: string; url?: string }[] = [
    { text: basics.email, url: `mailto:${basics.email}` },
    { text: basics.phone, url: `tel:${basics.phone.replace(/\s+/g, '')}` },
    { text: basics.location },
    ...basics.profiles.map(p => ({ text: p.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), url: p.url })),
  ];
  font(9, 'normal', COLOR.muted);
  const sep = '   |   ';
  const sepW = doc.getTextWidth(sep);
  let x = PAGE.margin;
  const contactLh = 9 * LH;
  contacts.forEach((c, i) => {
    const w = doc.getTextWidth(c.text);
    if (i > 0 && x + sepW + w > PAGE.w - PAGE.margin) {
      x = PAGE.margin;
      y += contactLh;
    } else if (i > 0) {
      doc.setTextColor(COLOR.rule[0], COLOR.rule[1], COLOR.rule[2]);
      doc.text(sep, x, y + 9 * 0.3528);
      x += sepW;
    }
    doc.setTextColor(COLOR.muted[0], COLOR.muted[1], COLOR.muted[2]);
    doc.text(c.text, x, y + 9 * 0.3528);
    if (c.url) {
      doc.link(x, y, w, contactLh, { url: c.url });
    }
    x += w;
  });
  y += contactLh;

  // ---------- profile ----------
  section('Profile');
  paragraph(summary(cv, now), opt.compact ? 9.5 : 10);
  if (!opt.compact && basics.availability) {
    y += 1;
    paragraph(basics.availability, 9.5, PAGE.margin, CONTENT_W, COLOR.muted);
  }

  // ---------- experience ----------
  section('Experience');
  const roles = cv.experience.filter(e => opt.showInternships || !e.internship);
  roles.forEach((role: Experience, i) => {
    if (i > 0) y += opt.compact ? 2.2 : 3.2;
    ensure(16);
    const title = opt.compact ? `${role.position}, ${role.company}` : role.position;
    row(title, formatRange(role.start, role.end), 10.5);
    if (!opt.compact) {
      paragraph(`${role.company}  ·  ${role.location}`, 9.5, PAGE.margin, CONTENT_W, COLOR.muted);
    }
    y += 0.8;
    role.highlights.slice(0, opt.maxHighlights).forEach(h => bullet(h, opt.compact ? 9 : 9.5));
    if (opt.showTools && role.tools.length) {
      y += 0.6;
      paragraph(`Tools: ${role.tools.join(', ')}`, 8.5, PAGE.margin + 4, CONTENT_W - 4, COLOR.muted);
    }
  });

  // ---------- education ----------
  section('Education');
  cv.education.forEach((ed, i) => {
    if (i > 0) y += 3;
    row(`${ed.area}, ${ed.institution}`, formatRange(ed.start, ed.end), 10.5);
    const meta = [ed.studyType, ed.grade ? `Final grade ${ed.grade}` : ''].filter(Boolean).join('  ·  ');
    paragraph(meta, 9.5, PAGE.margin, CONTENT_W, COLOR.muted);
    if (!opt.compact) {
      y += 0.8;
      ed.highlights.forEach(h => bullet(h, 9.5));
    }
  });

  // ---------- skills ----------
  section('Skills');
  const labelW = 34;
  cv.skills.groups.forEach(group => {
    const size = opt.compact ? 9 : 9.5;
    font(size);
    const lines: string[] = doc.splitTextToSize(group.items.join(', '), CONTENT_W - labelW);
    const lh = size * LH;
    ensure(lh * lines.length);
    font(size, 'bold');
    doc.text(group.name, PAGE.margin, y + size * 0.3528);
    font(size);
    lines.forEach((line, i) => doc.text(line, PAGE.margin + labelW, y + size * 0.3528 + i * lh));
    y += lh * lines.length + 0.8;
  });

  // ---------- strengths ----------
  if (opt.showStrengths && cv.skills.soft.length) {
    section('Strengths');
    cv.skills.soft.forEach(s => {
      const size = 9.5;
      font(size, 'bold');
      const nameW = doc.getTextWidth(`${s.name}: `);
      font(size);
      // First line shares space with the bold label; wrap the rest at full width.
      const first: string[] = doc.splitTextToSize(s.description, CONTENT_W - nameW);
      const firstLine = first[0];
      const rest = s.description.slice(firstLine.length).trim();
      const lh = size * LH;
      ensure(lh);
      font(size, 'bold');
      doc.text(`${s.name}: `, PAGE.margin, y + size * 0.3528);
      font(size);
      doc.text(firstLine, PAGE.margin + nameW, y + size * 0.3528);
      y += lh;
      if (rest) paragraph(rest, size);
      y += 0.6;
    });
  }

  // ---------- languages ----------
  section('Languages');
  paragraph(cv.languages.map(l => `${l.language} (${l.fluency})`).join('   ·   '), opt.compact ? 9 : 9.5);

  // ---------- page footer ----------
  const pages = doc.getNumberOfPages();
  if (pages > 1) {
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      font(8, 'normal', COLOR.muted);
      doc.text(`${basics.name} – CV`, PAGE.margin, PAGE.h - 9);
      doc.text(`${p} / ${pages}`, PAGE.w - PAGE.margin, PAGE.h - 9, { align: 'right' });
    }
  }

  return doc;
}
