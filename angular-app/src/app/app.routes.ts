import { Routes } from '@angular/router';
import { AppComponent } from './components/app-component/app.component';

export const routes: Routes = [
  {path: '', component: AppComponent},
  { path: '**', redirectTo: '' }, 
];
