import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GuessResponse } from '../../classes/game';

@Injectable({
  providedIn: 'root'
})

export class MakeGuessService {

  constructor(private readonly http: HttpClient) {}

  public askQuestion(id : string, character_guess : string): Observable<GuessResponse> {
    const url: string = `${environment.apiUrl}/chat/guess-game/${id}/guess`;
    return this.http.post<GuessResponse>(url, {characterGuess: character_guess});
  }
}
