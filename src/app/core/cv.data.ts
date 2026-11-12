import data from '../../assets/CV.json';
import { Cv } from './cv.model';
import { totalMonths } from './date.utils';

/** Typed CV data. Assigning to `Cv` makes the compiler validate CV.json. */
export const CV: Cv = data;

/** Whole years of non-internship experience (overlapping roles counted once). */
export function yearsOfExperience(cv: Cv = CV, now: Date = new Date()): number {
  return Math.floor(totalMonths(cv.experience.filter(e => !e.internship), now) / 12);
}

/** Summary with `{{years}}` filled in. */
export function summary(cv: Cv = CV, now: Date = new Date()): string {
  return cv.basics.summary.replace('{{years}}', String(yearsOfExperience(cv, now)));
}
