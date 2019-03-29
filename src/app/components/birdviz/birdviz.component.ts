import { Component, ViewEncapsulation } from '@angular/core';
import { BirdsService } from '../../services/birds.service';
import 'rxjs/add/operator/filter';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

@Component({
  selector: 'app-birdviz',
  templateUrl: './birdviz.component.html',
  styleUrls: ['./birdviz.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BirdvizComponent {
  birds;
  serverError;

  constructor(
    private birdsService: BirdsService
  ) { }

  // getBirds() {
  //   this.birdsService.getBirdObs().subscribe(
  //     data => {this.birds = data; },
  //     err => {
  //       this.serverError = true;
  //       console.error(err);
  //     },
  //     () => {
  //       console.log(this.birds);
  //       }
  //     );
  // }

  drawMap() {
    const projection = d3.geoTransverseMercator()
                       .rotate([76 + 35 / 60, -40]);

    const path = d3.geoPath()
                   .projection(projection);

    const svg = d3.select('.graphic')
                  .append('svg')
                  .attr('class', 'map')
                  .attr('x', 0)
                  .attr('y', 0)
                  // .attr('viewBox', '-30 -20 1000 600')
                  // .attr('preserveAspectRatio', 'xMidYMid')
                  .attr('width', 960)
                  .attr('height', 960);

    // svg.selectAll('path')
    //   .data()
    //   .enter()
    //   .append('path')
    //   .attr('d', path);
  }



  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    // this.getBirds();
    this.drawMap();
  }

}


