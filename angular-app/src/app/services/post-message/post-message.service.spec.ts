import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MessageResponse, Message, MessageReq } from '../../classes/chat';
import { environment } from '../../../environments/environment';
import { retry, Observable, throwError, catchError } from 'rxjs';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class PostMessageService {
  constructor(private readonly http: HttpClient) {}
    private readonly apiUrl = environment.apiUrl;
    public sendMessage(
      messageReq: MessageReq,
      id : string
    ): Observable<MessageResponse> {
      const url: string = `${environment.apiUrl}/chat/${id}/message`;
      return this.http.post<MessageResponse>(url, messageReq);
    }

    private handleError(error: HttpErrorResponse) {
      return throwError(() => error.error.message || error.statusText);
    }
}