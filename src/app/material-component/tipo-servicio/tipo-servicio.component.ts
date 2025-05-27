import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TipoServicioService } from './TipoServicioService';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tipo-servicio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './tipo-servicio.component.html',
  styleUrls: ['./tipo-servicio.component.scss']
})
export class TipoServicioComponent implements OnInit {
  tipoForm!: FormGroup;
  tipoServicios: any[] = [];
  tipoFormVisible = false;
  editandoTipo = false;
  tipoEditandoId: number | null = null;

  constructor(private fb: FormBuilder, private tipoService: TipoServicioService) {}

  ngOnInit(): void {
    this.tipoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required]
    });

    this.obtenerTipos();
  }

  obtenerTipos(): void {
    this.tipoService.getTipos().subscribe(data => {
      this.tipoServicios = data;
    });
  }

  guardarTipoServicio(): void {
    if (this.tipoForm.invalid) return;

    const data = { ...this.tipoForm.value };

    if (this.editandoTipo && this.tipoEditandoId !== null) {
      this.tipoService.updateTipo(this.tipoEditandoId, data).subscribe(() => {
        this.obtenerTipos();
        this.cancelarTipo();
      });
    } else {
      this.tipoService.createTipo(data).subscribe(() => {
        this.obtenerTipos();
        this.tipoForm.reset();
      });
    }
  }

  editarTipo(tipo: any): void {
    this.editandoTipo = true;
    this.tipoEditandoId = tipo.idTipo;
    this.tipoFormVisible = true;

    this.tipoForm.setValue({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion
    });
  }

  cancelarTipo(): void {
    this.editandoTipo = false;
    this.tipoEditandoId = null;
    this.tipoForm.reset();
    this.tipoFormVisible = false;
  }

  eliminarTipo(id: number): void {
    if (confirm('¿Eliminar este tipo de servicio?')) {
      this.tipoService.deleteTipo(id).subscribe(() => {
        this.obtenerTipos();
      });
    }
  }
}
