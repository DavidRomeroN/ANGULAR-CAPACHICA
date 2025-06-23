import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CarritoItem } from '../models/carrito-item.model';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private baseUrl = 'http://localhost:8080/api/carrito';

  constructor(private http: HttpClient) {}

  agregarItem(usuarioId: number, item: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/agregar`, {
      usuarioId,
      ...item
    });
  }

  obtenerItems(usuarioId: number): Observable<CarritoItem[]> {
    return this.http.get<CarritoItem[]>(`${this.baseUrl}/${usuarioId}`);
  }

  eliminarItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/item/${id}`);
  }

  reservarItem(itemId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservar/${itemId}`, {});
  }

  reservarTodo(usuarioId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservar-todo?usuarioId=${usuarioId}`, {});
  }

  editarCantidad(itemId: number, cantidad: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/item/${itemId}/cantidad`, { cantidad });
  }
}
