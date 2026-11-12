import { Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { PdfDownloadService } from '../../core/pdf/pdf-download.service';
import { I18nService } from '../../core/i18n.service';
import type { PdfVariant } from '../../core/pdf/cv-pdf.builder';

/**
 * "Download CV" button with a small menu: one-page resume or full CV (both PDF, generated
 * client-side in the current page language).
 *
 *   <app-download-menu />                     primary button (hero, CTA)
 *   <app-download-menu appearance="ghost" />  outlined button
 *   <app-download-menu [compact]="true" />    label shortened for the navbar
 */
@Component({
  selector: 'app-download-menu',
  templateUrl: './download-menu.component.html',
  styleUrl: './download-menu.component.css',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'open.set(false)',
  },
})
export class DownloadMenuComponent {
  readonly appearance = input<'primary' | 'ghost'>('primary');
  readonly compact = input(false);
  /** Align the menu to the button's left or right edge. */
  readonly align = input<'left' | 'right'>('left');

  protected readonly pdf = inject(PdfDownloadService);
  protected readonly i18n = inject(I18nService);
  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly options = computed<{ variant: PdfVariant; title: string; detail: string; icon: string }[]>(() => {
    const t = this.i18n.t().download;
    return [
      { variant: 'resume', title: t.resume, detail: t.resumeDetail, icon: 'bi-file-earmark-text' },
      { variant: 'cv', title: t.cv, detail: t.cvDetail, icon: 'bi-file-earmark-richtext' },
    ];
  });

  toggle(): void {
    this.open.update(v => !v);
  }

  async choose(variant: PdfVariant): Promise<void> {
    await this.pdf.download(variant);
    this.open.set(false);
  }

  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
