import { Injectable, inject, signal } from '@angular/core';
import { track } from '@vercel/analytics';
import { I18nService } from '../i18n.service';
import type { PdfVariant } from './cv-pdf.builder';

/**
 * Generates the CV / resume PDF in the browser on demand, in the current page language.
 * jsPDF and the layout code are lazy-loaded, so they never touch the initial bundle.
 */
@Injectable({ providedIn: 'root' })
export class PdfDownloadService {
  private readonly i18n = inject(I18nService);

  /** Variant currently being generated (for button spinners), or null. */
  readonly busy = signal<PdfVariant | null>(null);
  readonly failed = signal(false);

  async download(variant: PdfVariant): Promise<void> {
    if (this.busy()) return;
    this.busy.set(variant);
    this.failed.set(false);
    const lang = this.i18n.lang();
    const cv = this.i18n.cv();
    try {
      const [{ jsPDF }, { buildCvPdf, pdfFileName }] = await Promise.all([
        import('jspdf'),
        import('./cv-pdf.builder'),
      ]);
      buildCvPdf(jsPDF, cv, variant, lang).save(pdfFileName(cv, variant, lang));
      // Custom event (Vercel Analytics; only recorded on plans that include custom events).
      track('PDF Download', { variant, lang });
    } catch (err) {
      console.error('PDF generation failed', err);
      this.failed.set(true);
    } finally {
      this.busy.set(null);
    }
  }
}
