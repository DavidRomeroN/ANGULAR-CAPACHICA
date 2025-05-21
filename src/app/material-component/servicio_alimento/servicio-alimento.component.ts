import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicioAlimentoService } from './servicio-alimento.service';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';

@Component({
  standalone: true,
  selector: 'app-servicio-alimento',
  templateUrl: './servicio-alimento.component.html',
  styleUrls: ['./servicio-alimento.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatOptionModule
  ]
})
export class ServicioAlimentoComponent implements OnInit {
  alimentoForm!: FormGroup;
  alimentos: any[] = [];
  displayedColumns: string[] = [
    'tipoComida',
    'estiloGastronomico',
    'incluyeBebidas',
    'servicio',
    'acciones'
  ];
  editando = false;
  alimentoEditandoId: number | null = null;

  bebidas = ['SI', 'NO'];

  // Propiedades para manejar la visibilidad del formulario
  formularioVisible = false;

  constructor(
    private fb: FormBuilder,
    private servicioAlimentoService: ServicioAlimentoService
  ) {}

  ngOnInit(): void {
    this.alimentoForm = this.fb.group({
      tipoComida: ['', Validators.required],
      estiloGastronomico: ['', Validators.required],
      incluyeBebidas: ['SI', Validators.required],
      servicio: [null, Validators.required]
    });

    this.obtenerAlimentos();
  }

  obtenerAlimentos(): void {
    this.servicioAlimentoService.getAlimentos().subscribe(data => {
      this.alimentos = data;
    });
  }

  guardarAlimento(): void {
    if (this.alimentoForm.invalid) return;

    const data = { ...this.alimentoForm.value };

    if (this.editando && this.alimentoEditandoId !== null) {
      this.servicioAlimentoService.updateAlimento(this.alimentoEditandoId, data).subscribe(() => {
        this.obtenerAlimentos();
        this.cancelarEdicion();
      });
    } else {
      this.servicioAlimentoService.createAlimento(data).subscribe(() => {
        this.obtenerAlimentos();
        this.alimentoForm.reset({ incluyeBebidas: 'SI' });
      });
    }
  }

  editarAlimento(alimento: any): void {
    this.editando = true;
    this.alimentoEditandoId = alimento.idAlimentacion;

    this.alimentoForm.setValue({
      tipoComida: alimento.tipoComida,
      estiloGastronomico: alimento.estiloGastronomico,
      incluyeBebidas: alimento.incluyeBebidas,
      servicio: alimento.servicio.idServicio
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.alimentoEditandoId = null;
    this.alimentoForm.reset({ incluyeBebidas: 'SI' });
  }

  eliminarAlimento(id: number): void {
    if (confirm('¿Estás seguro de eliminar este servicio de alimentación?')) {
      this.servicioAlimentoService.deleteAlimento(id).subscribe(() => {
        this.obtenerAlimentos();
      });
    }
  }

  // Método para alternar la visibilidad del formulario
  toggleFormulario(): void {
    this.formularioVisible = !this.formularioVisible;
  }
}
