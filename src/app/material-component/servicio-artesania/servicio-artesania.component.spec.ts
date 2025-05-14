import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicioArtesaniaComponent } from './servicio-artesania.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

describe('ServicioArtesaniaComponent', () => {
  let component: ServicioArtesaniaComponent;
  let fixture: ComponentFixture<ServicioArtesaniaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ServicioArtesaniaComponent,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatTableModule,
        MatIconModule,
        MatOptionModule,
        MatCheckboxModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServicioArtesaniaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
