import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CV, summary, yearsOfExperience } from '../../core/cv.data';
import { formatDuration, formatRange, monthsBetween } from '../../core/date.utils';
import { RevealDirective } from '../../shared/reveal.directive';
import { DownloadMenuComponent } from '../../shared/download-menu/download-menu.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RevealDirective, DownloadMenuComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  protected readonly cv = CV;
  protected readonly basics = CV.basics;
  protected readonly summary = summary();
  protected readonly current = CV.experience.find(e => e.end === null) ?? null;

  protected readonly stats = [
    { value: `${yearsOfExperience()}+`, label: 'years of experience' },
    { value: String(new Set(CV.experience.filter(e => !e.internship).map(e => e.company)).size), label: 'companies' },
    { value: String(CV.skills.groups.reduce((n, g) => n + g.items.length, 0)), label: 'technologies' },
  ];

  protected readonly experience = CV.experience.map(e => ({
    ...e,
    range: formatRange(e.start, e.end),
    duration: formatDuration(monthsBetween(e.start, e.end)),
  }));

  protected readonly education = CV.education.map(e => ({ ...e, range: formatRange(e.start, e.end) }));
}
