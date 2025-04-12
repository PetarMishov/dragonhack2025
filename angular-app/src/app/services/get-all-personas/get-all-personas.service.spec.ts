import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Character } from '../../classes/character';
import { environment } from '../../../environments/environment';
import { retry, Observable, throwError, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class GetAllPersonasService {
  constructor(private readonly http: HttpClient) {}

  public getPersonas(): Observable<Character[]> {
    const url: string = `${environment.apiUrl}/chat/personas`;
    return this.http
      .get<Character[]>(url)
      .pipe(retry(1), catchError(this.handleError));
  }
  
  private handleError(error: HttpErrorResponse) {
    return throwError(() => error.error.message || error.statusText);
  }
}


