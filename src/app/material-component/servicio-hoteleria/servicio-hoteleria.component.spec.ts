import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicioHoteleriaComponent } from './servicio-hoteleria.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';

describe('ServicioHoteleriaComponent', () => {
  let component: ServicioHoteleriaComponent;
  let fixture: ComponentFixture<ServicioHoteleriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ServicioHoteleriaComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatTableModule,
        MatIconModule,
        MatOptionModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioHoteleriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
