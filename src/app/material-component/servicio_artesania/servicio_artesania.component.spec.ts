import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicioArtesaniaComponent } from './servicio_artesania.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('ServicioArtesaniaComponent', () => {
  let component: ServicioArtesaniaComponent;
  let fixture: ComponentFixture<ServicioArtesaniaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioArtesaniaComponent, HttpClientTestingModule],
      providers: [provideHttpClient()] // Para evitar errores si se usa inject()
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioArtesaniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
