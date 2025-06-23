import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsesorComponent } from './asesor.component';

describe('AsesorComponent', () => {
  let component: AsesorComponent;
  let fixture: ComponentFixture<AsesorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsesorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
