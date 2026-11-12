import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  protected readonly i18n = inject(I18nService);
  protected readonly basics = computed(() => this.i18n.cv().basics);
  protected readonly year = new Date().getFullYear();
  protected readonly sourceUrl = 'https://github.com/joaodvalexandre/CVParser';
}
