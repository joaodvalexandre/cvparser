import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly t = this.i18n.t().notFound;
}
