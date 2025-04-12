import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Chat, MessageReq } from '../../classes/chat';
import { CommonModule } from '@angular/common';
import { GetAllChatsService } from '../../services/get-all-chats/get-all-chats.service.spec';
import { GetChatService } from '../../services/get-chat/get-chat.service.spec';
import { Scenario } from '../../classes/scenario';
import { GetScenariosService } from '../../services/get-scenarios/get-scenarios.service.spec';
import { BackgroundComponent } from '../background/background/background.component';
import { FormsModule } from '@angular/forms';
import { PostMessageService } from '../../services/post-message/post-message.service.spec';
import { NewLinePipe } from '../../pipes/new-line.pipe';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterOutlet, CommonModule, BackgroundComponent, FormsModule, NewLinePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  constructor(private readonly getAllChatsService : GetAllChatsService,
    private readonly getChatService : GetChatService,
    private readonly getScenariosService : GetScenariosService,
    private readonly postMessageService : PostMessageService
  ){}

  protected chats? : Chat[];
  protected scenarios! : Scenario[];
  protected current_chat? : Chat;
  newMessage: string = '';

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
      this.scenarios = out_scenarios.scenarios
      console.log(this.scenarios)
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

  sendMessage(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;
  
    if (!this.current_chat) {
      console.warn('No active chat selected.');
      return;
    }
  
    const newMsg = {
      _id: '',
      content: trimmed,
      role: 'user',
      timestamp: new Date()
    };

    this.current_chat.messages.push(newMsg);

    this.postMessageService.sendMessage({message: trimmed}, this.current_chat._id).subscribe({
      next: (res) => {
        const aiMessage = {
          _id: '',
          content: res.data.message,  
          role: 'character',
          timestamp: new Date()
        };
        console.log("Tried to push")
        console.log(aiMessage)
        this.current_chat?.messages.push(aiMessage)
        console.log(res)
      },
      error: (err) => console.error('Failed to send message:', err)
    });
  
    // Clear the input
    this.newMessage = '';
  }

}
