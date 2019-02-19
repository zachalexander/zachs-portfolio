import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdvizComponent } from './birdviz.component';

describe('BirdvizComponent', () => {
  let component: BirdvizComponent;
  let fixture: ComponentFixture<BirdvizComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirdvizComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirdvizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
