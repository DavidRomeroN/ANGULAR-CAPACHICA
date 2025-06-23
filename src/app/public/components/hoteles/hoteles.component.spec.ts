import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ServicioHoteleriaService } from '../../../material-component/servicio-hoteleria/servicio-hoteleria.service';
import {HoteleriaComponent} from "./hoteles.component";

describe('HoteleriaComponent', () => {
  let component: HoteleriaComponent;
  let fixture: ComponentFixture<HoteleriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoteleriaComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [ServicioHoteleriaService]
    }).compileComponents();

    fixture = TestBed.createComponent(HoteleriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
