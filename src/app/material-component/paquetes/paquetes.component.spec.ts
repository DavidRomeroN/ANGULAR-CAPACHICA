import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaquetesComponent } from './paquetes.component';
import { PaquetesService } from './paquetes.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('PaquetesComponent', () => {
  let component: PaquetesComponent;
  let fixture: ComponentFixture<PaquetesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PaquetesComponent, // Componente standalone
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        PaquetesService,
        provideAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaquetesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
