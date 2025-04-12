import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ChatReq, ChatResponse } from '../../classes/chat';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StartNewChatService {

  constructor(private readonly http: HttpClient) {}

  public startNewChat(
    chatReq: ChatReq
  ): Observable<ChatResponse> {
    const url: string = `${environment.apiUrl}/chat/chat`;
    return this.http.post<ChatResponse>(url, chatReq);
  }
}
