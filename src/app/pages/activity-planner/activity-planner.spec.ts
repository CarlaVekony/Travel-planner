import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityPlanner } from './activity-planner';

describe('ActivityPlanner', () => {
  let component: ActivityPlanner;
  let fixture: ComponentFixture<ActivityPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityPlanner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityPlanner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
