import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonHoteleriaComponent } from './boton-hoteleria.component';

describe('BotonHoteleriaComponent', () => {
  let component: BotonHoteleriaComponent;
  let fixture: ComponentFixture<BotonHoteleriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonHoteleriaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BotonHoteleriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
