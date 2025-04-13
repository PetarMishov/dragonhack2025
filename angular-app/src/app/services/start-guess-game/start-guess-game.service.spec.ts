import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameResponse } from '../../classes/game';

@Injectable({
  providedIn: 'root'
})
export class StartGuessGameService {

  constructor(private readonly http: HttpClient) {}

  public startGame(): Observable<GameResponse> {
    const url: string = `${environment.apiUrl}/chat/guess-game/start`;
    return this.http.post<GameResponse>(url, {});
  }
}
