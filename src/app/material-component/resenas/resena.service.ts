import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Resena} from "./resena.model";

@Injectable({
  providedIn: 'root'
})
export class ResenaService {
  private apiUrl = 'http://localhost:8080/resenas';

  constructor(private http: HttpClient) {}

  getResenas(): Observable<Resena[]> {
    return this.http.get<Resena[]>(this.apiUrl);
  }
}
