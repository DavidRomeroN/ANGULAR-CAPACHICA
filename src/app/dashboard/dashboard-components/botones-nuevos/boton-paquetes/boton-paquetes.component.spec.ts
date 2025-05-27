import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonPaquetesComponent } from './boton-paquetes.component';

describe('BotonPaquetesComponent', () => {
  let component: BotonPaquetesComponent;
  let fixture: ComponentFixture<BotonPaquetesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonPaquetesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BotonPaquetesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
