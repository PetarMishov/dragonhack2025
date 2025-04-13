import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuestionResponse } from '../../classes/game';

@Injectable({
  providedIn: 'root'
})

export class AskQuestionService {

  constructor(private readonly http: HttpClient) {}

  public askQuestion(id : string, my_question : string): Observable<QuestionResponse> {
    const url: string = `${environment.apiUrl}/chat/guess-game/${id}/question`;
    return this.http.post<QuestionResponse>(url, {question: my_question});
  }
}
