import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GetAllPersonasService } from '../../services/get-all-personas/get-all-personas.service.spec';
import { Character } from '../../classes/character';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from '../background/background/background.component';
import { StartNewChatService } from '../../services/start-new-chat/start-new-chat.service.spec';
import { Scenario } from '../../classes/scenario';
import { GetScenariosService } from '../../services/get-scenarios/get-scenarios.service.spec';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BackgroundComponent],
  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent {
  constructor(private readonly getAllPersonasService : GetAllPersonasService,
    private readonly startNewChatService : StartNewChatService,
    private readonly getScenariosService : GetScenariosService
  ){}

  protected personas?: Character[];
  protected selected_persona? : Character;
  protected persona_scenarios? : Scenario[];

  ngOnInit(){
    this.getPersonas()
  }

  private getPersonas() {
    this.getAllPersonasService.getPersonas()
    .subscribe((out_personas) => {
      console.log(out_personas)
      this.personas = out_personas
    })
  }

  public popupScenarios(persona: Character){
    this.selected_persona = persona
    var p_id = ''
    for (const [key, value] of Object.entries(persona)) {
      if (key == '_id'){
        p_id = value
      }
    }
    console.log(p_id)
    this.getScenariosService.getScenariosById(p_id)
    .subscribe((out_scenarios) => {
      console.log(out_scenarios)
      this.persona_scenarios = out_scenarios.scenarios
    })
     
  }

  public startNewChat(persona : Character, scenario : Scenario) {
    var p_id = ''
    for (const [key, value] of Object.entries(persona)) {
      if (key == '_id'){
        p_id = value
      }
    }
    var character_id = p_id
    var scenario_id = scenario._id
    var title_ = 'custom_title'
    var newChatReq = {
      characterId : character_id,
      scenarioId : scenario_id,
      title : title_
    }
    console.log(newChatReq)
    this.startNewChatService.startNewChat(newChatReq).subscribe((new_chat_id) => {
    })
  }
}
