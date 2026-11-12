import data from '../../assets/CV.json';
import { Cv } from './cv.model';
import { toMonthIndex } from './date.utils';

/** Typed CV data. Assigning to `Cv` makes the compiler validate CV.json. */
export const CV: Cv = data;

/** Whole years elapsed since `basics.careerStart` (e.g. Aug 2018 -> Nov 2026 = 8). */
export function yearsOfExperience(cv: Cv = CV, now: Date = new Date()): number {
  return Math.floor((toMonthIndex(null, now) - toMonthIndex(cv.basics.careerStart, now)) / 12);
}

/** Summary with `{{years}}` filled in. */
export function summary(cv: Cv = CV, now: Date = new Date()): string {
  return cv.basics.summary.replace('{{years}}', String(yearsOfExperience(cv, now)));
}
