import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NyStateElevationMapComponent } from './ny-state-elevation-map.component';

describe('NyStateElevationMapComponent', () => {
  let component: NyStateElevationMapComponent;
  let fixture: ComponentFixture<NyStateElevationMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NyStateElevationMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NyStateElevationMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
