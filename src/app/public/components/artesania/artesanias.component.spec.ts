import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtesaniasComponent } from './artesanias.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ServicioArtesaniaService } from '../../../material-component/servicio-artesania/servicio-artesania.service';

describe('ArtesaniasComponent', () => {
  let component: ArtesaniasComponent;
  let fixture: ComponentFixture<ArtesaniasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtesaniasComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ServicioArtesaniaService]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtesaniasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
