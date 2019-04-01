import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParksVisualComponent } from './parks-visual.component';

describe('ParksVisualComponent', () => {
  let component: ParksVisualComponent;
  let fixture: ComponentFixture<ParksVisualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParksVisualComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParksVisualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
