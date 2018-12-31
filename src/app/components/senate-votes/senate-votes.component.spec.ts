import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SenateVotesComponent } from './senate-votes.component';

describe('SenateVotesComponent', () => {
  let component: SenateVotesComponent;
  let fixture: ComponentFixture<SenateVotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SenateVotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SenateVotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
