import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GetAllPersonasService } from '../../services/get-all-personas/get-all-personas.service.spec';
import { Character } from '../../classes/character';
import { CommonModule } from '@angular/common';
import { BackgroundComponent } from '../background/background/background.component';
import { StartNewChatService } from '../../services/start-new-chat/start-new-chat.service.spec';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BackgroundComponent],
  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent {
  constructor(private readonly getAllPersonasService : GetAllPersonasService,
    private readonly startNewChatService : StartNewChatService
  ){}

  protected personas?: Character[];

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

  public startNewChat() {
    var character_id = ''
    var scenario_id = ''
    var title_ = ''
    var newChatReq = {
      characterId : character_id,
      scenarioId : scenario_id,
      title : title_
    }

    this.startNewChatService.startNewChat(newChatReq).subscribe((new_chat_id) => {
      console.log("siu")
    })
  }
}
