import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonAlimentacionComponent } from './boton-alimentacion.component';

describe('BotonAlimentacionComponent', () => {
  let component: BotonAlimentacionComponent;
  let fixture: ComponentFixture<BotonAlimentacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonAlimentacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BotonAlimentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
