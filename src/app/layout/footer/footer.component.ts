import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CV } from '../../core/cv.data';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  protected readonly basics = CV.basics;
  protected readonly year = new Date().getFullYear();
  protected readonly sourceUrl = 'https://github.com/joaodvalexandre/CVParser';
}
