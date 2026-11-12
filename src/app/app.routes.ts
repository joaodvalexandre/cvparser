import { inject } from '@angular/core';
import { CanActivateFn, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { I18nService } from './core/i18n.service';
import { Lang, STRINGS } from './core/i18n';

/** Sets the app language before any page in the group renders (server and browser). */
const withLang = (lang: Lang): CanActivateFn => () => {
  inject(I18nService).setLang(lang);
  return true;
};

/**
 * The same pages for each language. Each call creates new route objects, so moving between
 * languages re-creates the page components (they read the language once on construction).
 */
function pages(lang: Lang): Routes {
  const t = STRINGS[lang].titles;
  return [
    { path: '', pathMatch: 'full', redirectTo: 'home' },
    { path: 'home', component: HomeComponent, title: t.home },
    {
      path: 'projects',
      loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
      title: t.projects,
    },
    {
      path: 'contact',
      loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
      title: t.contact,
    },
    // Old URLs kept working.
    { path: 'portfolio', redirectTo: 'projects' },
    { path: 'contacts', redirectTo: 'contact' },
    { path: 'about', redirectTo: 'home' },
    { path: '404', component: NotFoundComponent, title: t.notFound },
    { path: '**', redirectTo: '404' },
  ];
}

export const routes: Routes = [
  // Landing on "/" picks the saved or browser language.
  { path: '', pathMatch: 'full', redirectTo: () => (inject(I18nService).preferred() === 'pt' ? '/pt/home' : '/home') },
  { path: 'pt', canActivate: [withLang('pt')], children: pages('pt') },
  { path: '', canActivate: [withLang('en')], children: pages('en') },
];
