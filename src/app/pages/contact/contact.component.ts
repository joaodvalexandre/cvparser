import { Component, inject, signal } from '@angular/core';
import { I18nService } from '../../core/i18n.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { DownloadMenuComponent } from '../../shared/download-menu/download-menu.component';

interface ContactItem {
  icon: string;
  label: string;
  value: string;
  href: string;
  /** Show a copy-to-clipboard button. */
  copy?: boolean;
  external?: boolean;
}

@Component({
  selector: 'app-contact',
  imports: [RevealDirective, DownloadMenuComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  private readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t().contact;
  protected readonly basics = this.i18n.cv().basics;
  protected readonly copied = signal<string | null>(null);
  private copyTimer?: ReturnType<typeof setTimeout>;

  protected readonly items: ContactItem[] = [
    { icon: 'envelope', label: this.t.email, value: this.basics.email, href: `mailto:${this.basics.email}`, copy: true },
    { icon: 'telephone', label: this.t.phone, value: this.basics.phone, href: `tel:${this.basics.phone.replace(/\s+/g, '')}`, copy: true },
    {
      icon: 'geo-alt',
      label: this.t.location,
      value: this.basics.location,
      href: `https://maps.google.com/?q=${encodeURIComponent(this.basics.location)}`,
      external: true,
    },
    ...this.basics.profiles.map(p => ({
      icon: p.icon,
      label: p.network,
      value: `@${p.username}`,
      href: p.url,
      external: true,
    })),
  ];

  async copy(item: ContactItem): Promise<void> {
    try {
      await navigator.clipboard.writeText(item.value);
      this.copied.set(item.label);
      clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.copied.set(null), 1800);
    } catch {
      window.location.href = item.href;
    }
  }
}
