import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { summary, yearsOfExperience } from '../../core/cv.data';
import { formatDuration, formatRange, monthsBetween } from '../../core/date.utils';
import { I18nService } from '../../core/i18n.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { DownloadMenuComponent } from '../../shared/download-menu/download-menu.component';

/**
 * Reads the language once: switching language navigates to a different route group,
 * which re-creates this component.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, RevealDirective, DownloadMenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly i18n = inject(I18nService);
  private readonly lang = this.i18n.lang();
  protected readonly t = this.i18n.t();
  protected readonly cv = this.i18n.cv();
  protected readonly basics = this.cv.basics;
  protected readonly summary = summary(this.cv);
  protected readonly current = this.cv.experience.find(e => e.end === null) ?? null;

  protected readonly stats = [
    { value: `${yearsOfExperience(this.cv)}+`, label: this.t.home.stats.years },
    {
      value: String(new Set(this.cv.experience.filter(e => !e.internship).map(e => e.company)).size),
      label: this.t.home.stats.companies,
    },
    {
      value: String(this.cv.skills.groups.reduce((n, g) => n + g.items.length, 0)),
      label: this.t.home.stats.technologies,
    },
  ];

  protected readonly experience = this.cv.experience.map(e => ({
    ...e,
    range: formatRange(e.start, e.end, this.lang),
    duration: formatDuration(monthsBetween(e.start, e.end), this.lang),
  }));

  protected readonly education = this.cv.education.map(e => ({ ...e, range: formatRange(e.start, e.end, this.lang) }));
}
