import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Chat } from '../../classes/chat';
import { CommonModule } from '@angular/common';
import { GetAllChatsService } from '../../services/get-all-chats/get-all-chats.service.spec';
import { GetChatService } from '../../services/get-chat/get-chat.service.spec';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  constructor(private readonly getAllChatsService : GetAllChatsService,
    private readonly getChatService : GetChatService
  ){}

  protected chats? : Chat[];
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

  private getChatById(){
    this.getChatService.getChatById()
    .subscribe((out_chat) => {
      this.current_chat = out_chat
    })
  }

}
