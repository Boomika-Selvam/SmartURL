import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SmartUrl } from '../models/url.model';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  private apiUrl = `${environment.apiUrl}/urls`;

  constructor(private http: HttpClient) { }

  suggest(longUrl: string): Observable<{ suggestions: string[] }> {
    return this.http.post<{ suggestions: string[] }>(`${this.apiUrl}/suggest`, { longUrl });
  }

  create(longUrl: string, alias: string): Observable<{ url: SmartUrl }> {
    return this.http.post<{ url: SmartUrl }>(this.apiUrl, { longUrl, alias });
  }

  getHistory(): Observable<{ urls: SmartUrl[] }> {
    return this.http.get<{ urls: SmartUrl[] }>(this.apiUrl);
  }

  deleteUrl(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

