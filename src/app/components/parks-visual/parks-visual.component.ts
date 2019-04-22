import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import * as nyCounties from '../../../assets/nys-geo.json';

@Component({
  selector: 'app-parks-visual',
  templateUrl: './parks-visual.component.html',
  styleUrls: ['./parks-visual.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ParksVisualComponent implements OnInit {

  nyCounties;

  constructor() { }

  ngOnInit() {
    // this.printCounties();
  }

  // printCounties() {
  //   this.nyCounties = nyCounties;
  // }

}
