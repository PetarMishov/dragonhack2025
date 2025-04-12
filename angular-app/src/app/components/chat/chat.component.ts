import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Chat } from '../../classes/chat';
import { CommonModule } from '@angular/common';
import { GetAllChatsService } from '../../services/get-all-chats/get-all-chats.service.spec';
import { GetChatService } from '../../services/get-chat/get-chat.service.spec';
import { Scenario } from '../../classes/scenario';
import { GetScenariosService } from '../../services/get-scenarios/get-scenarios.service.spec';
import { BackgroundComponent } from '../background/background/background.component';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BackgroundComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  constructor(private readonly getAllChatsService : GetAllChatsService,
    private readonly getChatService : GetChatService,
    private readonly getScenariosService : GetScenariosService
  ){}

  protected chats? : Chat[];
  protected scenarios! : Scenario[];
  protected current_chat? : Chat;

  ngOnInit(){
    this.getChats()
  }

  private getChats() {
    this.getAllChatsService.getChats()
    .subscribe((out_chats) => {
      console.log(out_chats)
      this.chats = out_chats
    })
  }

  // private getChatById(id : string){
  //   this.getChatService.getChatById(id)
  //   .subscribe((out_chat) => {
  //     console.log(out_chat)
  //     this.current_chat = out_chat
  //   })
  // }

  private getScenariosById(id : string){
    this.getScenariosService.getScenariosById(id)
    .subscribe((out_scenarios) => {
      this.scenarios = out_scenarios
    })
  }

  public changeChat(id : string){
    this.getChatService.getChatById(id).subscribe((out_chat) => {
      this.current_chat = out_chat;
      console.log(this.current_chat);
  
      const character_id = this.current_chat.characterId;
      console.log(character_id);
  
      if (character_id) {
        this.getScenariosById(character_id);
      }
    });
  }


}
