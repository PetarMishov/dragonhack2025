import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Chat } from '../../classes/chat';
import { environment } from '../../../environments/environment';
import { retry, Observable, throwError, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class GetChatService {
  constructor(private readonly http: HttpClient) {}

  public getChatById(id : string): Observable<Chat> {
    const url: string = `${environment.apiUrl}/chat/chats/${id}`;
    return this.http
      .get<Chat>(url)
      .pipe(retry(1), catchError(this.handleError));
  }
  
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.message || error.statusText);
  }
}