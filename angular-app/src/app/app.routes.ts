import { Routes } from '@angular/router';
import { AppComponent } from './components/app-component/app.component';
import { StartComponent } from './components/start/start.component';

export const routes: Routes = [
  {path: '', component: StartComponent},
  { path: '**', redirectTo: '' }, 
];
