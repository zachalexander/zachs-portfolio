import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticsMapComponent } from './politics-map.component';

describe('PoliticsMapComponent', () => {
  let component: PoliticsMapComponent;
  let fixture: ComponentFixture<PoliticsMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoliticsMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliticsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
