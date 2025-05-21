import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DemoMaterialModule } from 'src/app/demo-material-module';
import { NgFor } from '@angular/common';
import { AddProveedorDialogComponent } from './add-proveedor-dialog.component';
import {ProveedoresService} from "../../../material-component/proveedores/proveedores.service";

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [DemoMaterialModule, NgFor],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactsComponent implements OnInit {
  contactsData: any[] = [];

  constructor(
    private proveedorService: ProveedoresService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProveedores();
    this.cargarContactos();
  }

  loadProveedores() {
    this.proveedorService.getAll().subscribe((data) => {
      this.contactsData = data;
    });
  }

  openDialog(proveedor?: any): void {
    const dialogRef = this.dialog.open(AddProveedorDialogComponent, {
      width: '400px',
      data: proveedor || null // ← le pasamos el proveedor si lo hay
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.cargarContactos(); // recarga la lista
      }
    });
  }


  editar(proveedor: any) {
    // lógica para abrir el diálogo con datos de proveedor
  }

  eliminar(id: number) {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      this.proveedorService.delete(id).subscribe(() => {
        this.cargarContactos(); // refrescar la lista
      });
    }
  }

  cargarContactos(): void {
    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.contactsData = data;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
      }
    });
  }


}
