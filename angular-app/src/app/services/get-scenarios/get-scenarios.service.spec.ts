import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Scenario, ScenarioList } from '../../classes/scenario';
import { environment } from '../../../environments/environment';
import { retry, Observable, throwError, catchError } from 'rxjs';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class GetScenariosService {
  constructor(private readonly http: HttpClient) {}

  public getScenariosById(id : string): Observable<ScenarioList> {
    const url: string = `${environment.apiUrl}/chat/scenarios/character/${id}`;
    return this.http
          .get<{ success: boolean; data: ScenarioList}>(url)
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