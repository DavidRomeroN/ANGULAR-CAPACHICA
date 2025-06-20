import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { CarritoService } from '../../Services/carrito.service';
import { CarritoItem } from '../../models/carrito-item.model';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit {
  @Input() visible = false;
  @Output() carritoActualizado = new EventEmitter<number>();
  items: CarritoItem[] = [];
  usuarioId = 0;

  constructor(private carritoService: CarritoService) {}

  ngOnInit(): void {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogueado') || '{}');
    this.usuarioId = usuario?.idUsuario || 0;
    this.cargarItems();
  }

  cargarItems(): void {
    this.carritoService.obtenerItems(this.usuarioId).subscribe({
      next: (data) => {
        this.items = data;
        this.carritoActualizado.emit(this.items.length); // 👈 emitimos al padre
      },
      error: (err) => {
        console.error('Error al cargar carrito', err);
        this.items = [];
        this.carritoActualizado.emit(0); // 👈 emitimos 0 en caso de error
      }
    });
  }

  calcularTotal(item: CarritoItem): number {
    return item.precioUnitario * item.cantidad;
  }

  eliminar(id: number): void {
    this.carritoService.eliminarItem(id).subscribe({
      next: () => this.cargarItems(),
      error: err => console.error('Error al eliminar item:', err)
    });

  }

  reservarItem(id: number): void {
    this.carritoService.reservarItem(id).subscribe({
      next: () => this.cargarItems(),
      error: err => console.error('Error al reservar item:', err)
    });
  }

  editarCantidad(item: CarritoItem): void {
    this.carritoService.editarCantidad(item.id!, item.cantidad).subscribe({
      next: () => this.cargarItems(),
      error: err => console.error('Error al editar cantidad:', err)
    });
  }

  reservarTodo(): void {
    this.carritoService.reservarTodo(this.usuarioId).subscribe({
      next: () => this.cargarItems(),
      error: (err) => console.error('Error al reservar todo:', err)
    });
  }

  cerrar(): void {
    this.visible = false;
  }
}
