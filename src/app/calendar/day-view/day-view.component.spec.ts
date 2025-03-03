import { ComponentFixture, TestBed } from '@angular/core/testing'; 
import { DayViewComponent } from './day-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';  // Import `of` to create observables

describe('DayViewComponent', () => {
  let component: DayViewComponent;
  let fixture: ComponentFixture<DayViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DayViewComponent],
      providers: [
        {
          provide: ActivatedRoute, 
          useValue: {
            paramMap: of({
              get: () => '03-03-2025'
            })
          }
        }
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DayViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
