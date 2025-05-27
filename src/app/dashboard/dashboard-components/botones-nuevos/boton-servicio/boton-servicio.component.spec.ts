import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonServicioComponent } from './boton-servicio.component';

describe('BotonServicioComponent', () => {
  let component: BotonServicioComponent;
  let fixture: ComponentFixture<BotonServicioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonServicioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BotonServicioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
