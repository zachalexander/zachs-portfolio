import { Component, OnInit, ViewEncapsulation  } from '@angular/core';
import * as d3 from 'd3';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.drawLineChart();
  }

  drawLineChart() {

    const dataset = [
      [ 5, 20 ],
      [ 480, 90 ],
      [ 250, 50 ],
      [ 100, 33 ],
      [ 330, 95 ],
      [ 410, 12 ],
      [ 475, 44 ],
      [ 25, 67 ],
      [ 85, 21 ],
      [ 220, 88 ]
      ];

     let len = 500;
     let hei = 100;

     const margin = {top: 10, right: 20, bottom: 10, left: 20};

     len = len - margin.left - margin.right,
     hei = hei - margin.top - margin.bottom;

     const svg = d3.select('._graphic-1')
      .append('svg')
      .attr('width', len)
      .attr('height', hei);

      svg.selectAll('circle')
         .data(dataset)
         .enter()
         .append('circle')
         .attr('cx', function(d) {
           return d[0];
         })
         .attr('cy', function(d) {
           return d[1];
         })
         .attr('r', function(d) {
           return Math.sqrt(hei - d[1]);
         })
         .attr('stroke', '#fff');

       svg.selectAll('text')
          .data(dataset)
          .enter()
          .append('text')
          .text(function(d) {
            return d[0] + ',' + d[1];
          })
          .attr('x', function(d) {
            return d[0];
          })
          .attr('y', function(d) {
            return d[1];
          })
          .attr('font-family', 'sans-serif')
          .attr('font-size', '11px')
          .attr('fill', '#fff')
          .attr('font-weight', 'bolder');
  }
}
