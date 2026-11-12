import { Component, signal } from '@angular/core';
import { CV } from '../../core/cv.data';
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
  protected readonly basics = CV.basics;
  protected readonly copied = signal<string | null>(null);
  private copyTimer?: ReturnType<typeof setTimeout>;

  protected readonly items: ContactItem[] = [
    { icon: 'envelope', label: 'Email', value: CV.basics.email, href: `mailto:${CV.basics.email}`, copy: true },
    { icon: 'telephone', label: 'Phone', value: CV.basics.phone, href: `tel:${CV.basics.phone.replace(/\s+/g, '')}`, copy: true },
    { icon: 'geo-alt', label: 'Location', value: CV.basics.location, href: `https://maps.google.com/?q=${encodeURIComponent(CV.basics.location)}`, external: true },
    ...CV.basics.profiles.map(p => ({
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
