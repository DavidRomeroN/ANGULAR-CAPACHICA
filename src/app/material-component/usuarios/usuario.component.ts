import { Component, OnInit } from '@angular/core';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-usuario-list',
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.css']
})
export class UsuarioListComponent implements OnInit {
  userIds: number[] = [];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.usuarioService.getUserIds().subscribe(
      (ids) => {
        this.userIds = ids;
        console.log('IDs obtenidos:', this.userIds); // 👈 Aquí puedes verificar en consola
      },
      (error) => {
        console.error('Error al obtener los IDs de usuario', error);
      }
    );
  }
}
