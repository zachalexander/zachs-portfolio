// import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
// import * as d3 from 'd3';

// @Component({
//   selector: 'app-ny-state-elevation-map',
//   templateUrl: './ny-state-elevation-map.component.html',
//   styleUrls: ['./ny-state-elevation-map.component.scss'],
//   encapsulation: ViewEncapsulation.None
// })
// export class NyStateElevationMapComponent implements OnInit {

//   @ViewChild('chart') private chartContainer: ElementRef;
//   @Input() private data: Array<any>;

//   constructor() { }

//   ngOnInit() {
//     this.drawMap(this.data);
//   }

//   drawMap(data) {

//     console.log(data);

//     let width = 1200;
//     let height = 900;

//     const margin = {top: 40, right: 0, bottom: 20, left: 0};
//     height = height - margin.top - margin.bottom;
//     width = width - margin.right - margin.left;

//     const projection = d3.geoMercator()
//     .center([0, 42.954])
//     .rotate([76.5, 0])
//     .scale(7825)
//     .translate([(width / 2) - 95, height / 2 - 30]);

//     const countiesData = data.default.features;

//     const path = d3.geoPath()
//                    .projection(projection);

//     const svg = d3.select('.graphic')
//                   .append('svg')
//                   .attr('class', 'map')
//                   .attr('preserveAspectRatio', 'xMinYMin meet')
//                   .attr('viewBox', '0 0 1200 900');
//                   // .attr('height', height)
//                   // .attr('width', width);

//     svg.append('image')
//     .attr('xlink:href', '../../../assets/nys-updated.png')
//     .attr('class', 'raster')
//     .attr('height', height)
//     .attr('width', width);

//     svg.selectAll('path')
//       .data(countiesData)
//       .enter()
//       .append('path')
//       .attr('d', path)
//       .style('fill', 'none')
//       .style('stroke', '#333')
//       .style('stroke-width', '0.25')
//       .style('box-shadow', '5px 5px')
//       .style('shape-rendering', 'smoothEdges')
//       .attr('id', 'counties');

//     svg.append('text')
//        .text('NEW YORK STATE')
//        .attr('x', width / 2 - 80)
//        .attr('y', height / 2)
//        .attr('font-weight', '700')
//        .attr('font-color', '#444');

//     // svg.append('clipPath')
//     //     .attr('id', 'clip')
//     //     .append('use')
//     //     .attr('xlink:href', '#counties');

//     // svg.append('image')
//     //   .attr('clip-path', 'url(#clip)')
//     //   .attr('xlink:href', '../../../assets/nys-updated.png')
//     //   .attr('width', width)
//     //   .attr('height', height)
//     //   .attr('class', 'raster');

//   }

// }
