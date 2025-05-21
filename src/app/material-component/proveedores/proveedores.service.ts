import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiURL = 'http://localhost:8080/proveedores';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiURL);
  }

  create(proveedor: any): Observable<any> {
    return this.http.post(this.apiURL, proveedor, this.getHttpOptions());
  }

  update(id: number, proveedor: any): Observable<any> {
    return this.http.put(`${this.apiURL}/${id}`, proveedor, this.getHttpOptions());
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`);
  }
}
