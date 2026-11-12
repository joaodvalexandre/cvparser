import { Injectable, signal } from '@angular/core';
import { track } from '@vercel/analytics';
import { CV } from '../cv.data';
import type { PdfVariant } from './cv-pdf.builder';

/**
 * Generates the CV / resume PDF in the browser on demand.
 * jsPDF and the layout code are lazy-loaded, so they never touch the initial bundle.
 */
@Injectable({ providedIn: 'root' })
export class PdfDownloadService {
  /** Variant currently being generated (for button spinners), or null. */
  readonly busy = signal<PdfVariant | null>(null);
  readonly error = signal<string | null>(null);

  async download(variant: PdfVariant): Promise<void> {
    if (this.busy()) return;
    this.busy.set(variant);
    this.error.set(null);
    try {
      const [{ jsPDF }, { buildCvPdf, pdfFileName }] = await Promise.all([
        import('jspdf'),
        import('./cv-pdf.builder'),
      ]);
      buildCvPdf(jsPDF, CV, variant).save(pdfFileName(CV, variant));
      // Custom event (Vercel Analytics; only recorded on plans that include custom events).
      track('PDF Download', { variant });
    } catch (err) {
      console.error('PDF generation failed', err);
      this.error.set('Could not generate the PDF. Please try again.');
    } finally {
      this.busy.set(null);
    }
  }
}
