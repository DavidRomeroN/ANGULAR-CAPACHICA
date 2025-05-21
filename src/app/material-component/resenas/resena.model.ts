// resena.model.ts
export interface Resena {
  idResena: number;
  comentario: string;
  calificacion: number;
  fecha: string;
  usuario: {
    email: string;
  };
  paquete: {
    titulo: string;
  };
}
