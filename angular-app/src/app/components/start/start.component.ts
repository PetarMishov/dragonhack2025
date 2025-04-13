import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GetAllPersonasService } from '../../services/get-all-personas/get-all-personas.service.spec';
import { Character } from '../../classes/character';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from '../background/background/background.component';
import { StartNewChatService } from '../../services/start-new-chat/start-new-chat.service.spec';
import { Scenario } from '../../classes/scenario';
import { GetScenariosService } from '../../services/get-scenarios/get-scenarios.service.spec';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppCardComponent } from '../app-card/app-card.component';
import { ChatComponent } from '../chat/chat.component';
import { GetAllChatsService } from '../../services/get-all-chats/get-all-chats.service.spec';
import { Chat } from '../../classes/chat';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BackgroundComponent, AppCardComponent, FormsModule, ChatComponent],
  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent {
  constructor(private readonly getAllPersonasService: GetAllPersonasService,
    private readonly startNewChatService: StartNewChatService,
    private readonly getScenariosService: GetScenariosService,
    private readonly getAllChatsService: GetAllChatsService,
    private readonly router: Router
  ){}

  protected personas?: Character[];
  protected selected_persona?: Character;
  protected persona_scenarios?: Scenario[];
  protected chats?: Chat[];
  title: string = '';
  
  ngOnInit(){
    this.getPersonas();
    this.getChats();
  }

  private getPersonas() {
    this.getAllPersonasService.getPersonas()
    .subscribe((out_personas) => {
      console.log(out_personas);
      this.personas = out_personas;
    });
  }

  private getChats() {
    this.getAllChatsService.getChats()
    .subscribe((out_chats) => {
      console.log(out_chats);
      this.chats = out_chats;
    });
  }

  public popupScenarios(persona: Character){
    this.selected_persona = persona;
    var p_id = '';
    for (const [key, value] of Object.entries(persona)) {
      if (key == '_id'){
        p_id = value;
      }
    }
    console.log(p_id);
    this.getScenariosService.getScenariosById(p_id)
    .subscribe((out_scenarios) => {
      console.log(out_scenarios);
      this.persona_scenarios = out_scenarios.scenarios;
    });
  }

  public navigateToChat(chatId: string) {
    this.router.navigate(['/chat', chatId]);
  }

  playGame(): void {
    this.router.navigate(['/guess-game']);
  }

  public startNewChat(persona: Character, scenario: Scenario) {
    var p_id = '';
    for (const [key, value] of Object.entries(persona)) {
      if (key == '_id'){
        p_id = value;
      }
    }
    var character_id = p_id;
    var scenario_id = scenario._id;
    var newChatReq = {
      characterId: character_id,
      scenarioId: scenario_id,
      title: this.title
    };

    if (!this.title){
      console.log("Please enter valid title");
      return;
    }
    
    console.log(newChatReq);
    this.startNewChatService.startNewChat(newChatReq).subscribe((res) => {
      const newChatId = res.data._id; // depends on what your backend returns
      this.router.navigate(['/chat', newChatId]);
    });
  }
}