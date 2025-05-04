import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicioHoteleriaComponent } from './servicio_hoteleria.component';

describe('ServicioHoteleriaComponent', () => {
  let component: ServicioHoteleriaComponent;
  let fixture: ComponentFixture<ServicioHoteleriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicioHoteleriaComponent] // 👈 porque es standalone
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioHoteleriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
