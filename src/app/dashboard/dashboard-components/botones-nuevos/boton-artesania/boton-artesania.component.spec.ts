import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonArtesaniaComponent } from './boton-artesania.component';

describe('BotonArtesaniaComponent', () => {
  let component: BotonArtesaniaComponent;
  let fixture: ComponentFixture<BotonArtesaniaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonArtesaniaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BotonArtesaniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
