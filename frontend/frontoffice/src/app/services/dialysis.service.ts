import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialysisService {

  private baseUrl = 'http://localhost:8075/api';

  constructor(private http: HttpClient) { }

  // PATIENT: my treatment
  getMyTreatment(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/treatments/patient/my`);
  }

  // PATIENT: my session history
  getMyHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/sessions/my-history`);
  }
}
