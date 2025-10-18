import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Itineraries } from './itineraries';

describe('Itineraries', () => {
  let component: Itineraries;
  let fixture: ComponentFixture<Itineraries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Itineraries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Itineraries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
