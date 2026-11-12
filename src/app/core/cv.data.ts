import en from '../../assets/CV.json';
import pt from '../../assets/CV.pt.json';
import { Cv } from './cv.model';
import { toMonthIndex } from './date.utils';
import type { Lang } from './i18n';

/** Typed CV data per language. Assigning to `Cv` makes the compiler validate both JSON files. */
export const CV_EN: Cv = en;
export const CV_PT: Cv = pt;
export const CVS: Record<Lang, Cv> = { en: CV_EN, pt: CV_PT };

/** English CV; use for language-independent values (GitHub config, contact details). */
export const CV = CV_EN;

/** Whole years elapsed since `basics.careerStart` (e.g. Aug 2018 -> Nov 2026 = 8). */
export function yearsOfExperience(cv: Cv = CV, now: Date = new Date()): number {
  return Math.floor((toMonthIndex(null, now) - toMonthIndex(cv.basics.careerStart, now)) / 12);
}

/** Summary with `{{years}}` filled in. */
export function summary(cv: Cv = CV, now: Date = new Date()): string {
  return cv.basics.summary.replace('{{years}}', String(yearsOfExperience(cv, now)));
}
