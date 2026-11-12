import { Component, ElementRef, inject, input, signal } from '@angular/core';
import { PdfDownloadService } from '../../core/pdf/pdf-download.service';
import type { PdfVariant } from '../../core/pdf/cv-pdf.builder';

/**
 * "Download CV" button with a small menu: full CV or one-page resume (both PDF, generated client-side).
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
  /** Open the menu upwards / aligned right. */
  readonly align = input<'left' | 'right'>('left');

  protected readonly pdf = inject(PdfDownloadService);
  protected readonly open = signal(false);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly options: { variant: PdfVariant; title: string; detail: string; icon: string }[] = [
    { variant: 'resume', title: 'Resume', detail: 'One page, the essentials', icon: 'bi-file-earmark-text' },
    { variant: 'cv', title: 'Full CV', detail: 'Complete history, 2 pages', icon: 'bi-file-earmark-richtext' },
  ];

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
