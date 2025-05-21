import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicioArtesaniaService } from './servicio-artesania.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  standalone: true,
  selector: 'app-servicio-artesania',
  templateUrl: './servicio-artesania.component.html',
  styleUrls: ['./servicio-artesania.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatOptionModule,
    MatCheckboxModule
  ]
})
export class ServicioArtesaniaComponent implements OnInit {
  artesaniaForm!: FormGroup;
  artesanias: any[] = [];
  displayedColumns: string[] = [
    'tipoArtesania',
    'nivelDificultad',
    'duracionTaller',
    'incluyeMaterial',
    'artesania',
    'origenCultural',
    'maxParticipantes',
    'visitaTaller',
    'artesano',
    'servicio',
    'acciones'
  ];

  editando = false;
  artesaniaEditandoId: number | null = null;

  niveles = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'];

  // Nueva propiedad para controlar la visibilidad del formulario
  formularioVisible = false;

  constructor(
    private fb: FormBuilder,
    private servicioArtesaniaService: ServicioArtesaniaService
  ) {}

  ngOnInit(): void {
    this.artesaniaForm = this.fb.group({
      tipoArtesania: ['', Validators.required],
      nivelDificultad: ['', Validators.required],
      duracionTaller: [0, Validators.required],
      incluyeMaterial: [false],
      artesania: ['', Validators.required],
      origenCultural: ['', Validators.required],
      maxParticipantes: [1, Validators.required],
      visitaTaller: [false],
      artesano: ['', Validators.required],
      servicio: [null, Validators.required]
    });

    this.obtenerArtesanias();
  }

  obtenerArtesanias(): void {
    this.servicioArtesaniaService.getArtesanias().subscribe(data => {
      this.artesanias = data;
    });
  }

  guardarArtesania(): void {
    if (this.artesaniaForm.invalid) return;

    const data = { ...this.artesaniaForm.value };

    if (this.editando && this.artesaniaEditandoId !== null) {
      this.servicioArtesaniaService.updateArtesania(this.artesaniaEditandoId, data).subscribe(() => {
        this.obtenerArtesanias();
        this.cancelarEdicion();
      });
    } else {
      this.servicioArtesaniaService.createArtesania(data).subscribe(() => {
        this.obtenerArtesanias();
        this.artesaniaForm.reset();
      });
    }
  }

  editarArtesania(a: any): void {
    this.editando = true;
    this.artesaniaEditandoId = a.idArtesania;

    this.artesaniaForm.setValue({
      tipoArtesania: a.tipoArtesania,
      nivelDificultad: a.nivelDificultad,
      duracionTaller: a.duracionTaller,
      incluyeMaterial: a.incluyeMaterial,
      artesania: a.artesania,
      origenCultural: a.origenCultural,
      maxParticipantes: a.maxParticipantes,
      visitaTaller: a.visitaTaller,
      artesano: a.artesano,
      servicio: a.servicio.idServicio
    });
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.artesaniaEditandoId = null;
    this.artesaniaForm.reset();
  }

  eliminarArtesania(id: number): void {
    if (confirm('¿Eliminar esta artesanía?')) {
      this.servicioArtesaniaService.deleteArtesania(id).subscribe(() => {
        this.obtenerArtesanias();
      });
    }
  }

  // Método para alternar la visibilidad del formulario
  toggleFormulario(): void {
    this.formularioVisible = !this.formularioVisible;
  }
}
