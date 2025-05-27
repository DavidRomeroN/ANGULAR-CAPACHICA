import { TestBed, async } from '@angular/core/testing';
import { PublicComponent } from './public.component';

describe('PublicComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublicComponent],
    }).compileComponents();
  }));

  it('should create the component', async(() => {
    const fixture = TestBed.createComponent(PublicComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
