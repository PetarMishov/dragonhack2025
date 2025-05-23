import { Routes } from '@angular/router';
import { AppComponent} from './components/app-component/app.component';
import { StartComponent } from './components/start/start.component';
import { ChatComponent } from './components/chat/chat.component';
import { GuessGameComponent } from './components/guess-game/guess-game.component';
import { FirstPageComponent } from './components/first-page/first-page.component';

export const routes: Routes = [
  {path: '', component: FirstPageComponent},
  {path: 'index', component: StartComponent},
  {path: 'chat', component: ChatComponent},
  {path: 'chat/:chatId', component: ChatComponent },
  {path: 'guess-game', component: GuessGameComponent},
  { path: '**', redirectTo: '' }, 
];
