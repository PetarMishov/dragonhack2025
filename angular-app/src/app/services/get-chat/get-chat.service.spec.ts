import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Chat } from '../../classes/chat';
import { environment } from '../../../environments/environment';
import { retry, Observable, throwError, catchError } from 'rxjs';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class GetChatService {
  constructor(private readonly http: HttpClient) {}

  public getChatById(id : string): Observable<Chat> {
    const url: string = `${environment.apiUrl}/chat/chat/${id}`;
    return this.http
          .get<{ success: boolean; data: Chat }>(url)
          .pipe(
            retry(1),
            map(response => response.data || []), // ✅ Extract `data`
            catchError(this.handleError)
          );
  }
  
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.message || error.statusText);
  }
}