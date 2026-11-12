import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const NAME = 'João Alexandre';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent, title: `${NAME} – Full-Stack PHP Developer` },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
    title: `Projects – ${NAME}`,
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: `Contact – ${NAME}`,
  },
  // Old URLs kept working.
  { path: 'portfolio', redirectTo: 'projects' },
  { path: 'contacts', redirectTo: 'contact' },
  { path: 'about', redirectTo: 'home' },
  { path: '404', component: NotFoundComponent, title: `Page not found – ${NAME}` },
  { path: '**', redirectTo: '404' },
];
