import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { I18nService } from './core/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected readonly i18n = inject(I18nService);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  skipToContent(): void {
    this.main().nativeElement.focus();
  }
}
