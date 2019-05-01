// import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import * as d3 from 'd3';
// // import * as stateData from '../../assets/us-states.json';
// // import * as stateFeatures from '../../assets/us-state-features.json';
// import 'rxjs/add/operator/filter';

// @Component({
//   selector: 'app-us-map',
//   templateUrl: './us-map.component.html',
//   styleUrls: ['./us-map.component.scss'],
//   encapsulation: ViewEncapsulation.None
// })
// export class UsMapComponent {

//   innerWidth;
//   width;
//   mobile = false;

//   constructor() { }

// // tslint:disable-next-line: use-life-cycle-interface
//   ngOnInit() {

//     this.innerWidth = window.innerWidth;
//       setTimeout(() => {
//         this.drawMap(this.innerWidth, 500);
//       }, 2000);
//   }

// addValues() {
//   // const stateDataset = stateData.default;
//   d3.csv('../../assets/firearm-deaths-2017.csv')
//     .then(function(data) {
//       data.forEach(element => {
//         const dataState = element.state;
//         const dataRate = parseFloat(element.rate);
//         const dataDeaths = element.deaths;

//         for (let i = 0; i < stateDataset.features.length; i++) {
//           const jsonState = stateDataset.features[i].properties.name;

//           if (dataState === jsonState) {
//             stateDataset.features[i].properties['value'] = dataRate;
//             stateDataset.features[i].properties.deaths = dataDeaths;
//           }
//         }
//       });
//     });

//   stateDataset.features.map(data => {
//     stateFeatures.default.map(features => {
//       if (data.properties.name === features.state) {
//         data.properties.flag_image_url = '../../assets/img/flags/' + features.slug + '-large.png';
//       }
//     });
//   });

//   return stateDataset.features;

// }

//   drawMap(width, height) {

//     d3.select('svg').remove();

//     const margin = {top: 10, right: 20, bottom: 10, left: 20};

//     width = width - margin.left - margin.right,
//     height = height - margin.top - margin.bottom;

//     const projection = d3.geoAlbersUsa();

//     const path = d3.geoPath()
//               .projection(projection);

//     const ext_color_domain = [2.5, 5.5, 11.5, 20.5, 24.5];

//     const color_domain = [2.5, 5.5, 11.5, 20.5, 24.5];

//     const legend_labels = ['2.5% - 5.3%', '5.4% - 13.5%', '13.6% - 16.9%', '17.0% - 20.9%', '>21.0%'];

//     const color_legend = d3.scaleLinear<string>()
//       .range(['#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'])
//       .domain(color_domain);

//     const svg = d3.select('.graphic')
//                 .append('svg')
//                 .attr('class', 'map')
//                 .attr('viewBox', '100 0 1000 600')
//                 .attr('preserveAspectRatio', 'xMidYMid')
//                 .attr('width', width + margin.top + margin.bottom)
//                 .attr('height', height + margin.right + margin.left);

//     const legend = svg.selectAll('g')
//       .data(ext_color_domain)
//       .classed('legend', true)
//       .enter().append('g')
//       .attr('class', 'legend');

//     const ls_w = 20, ls_h = 20;

//     legend.append('rect')
//       .attr('x', 820)
//       .attr('y', function (d, i) { return (height - (i * ls_h) - 2 * ls_h) - 40; })
//       .attr('width', ls_w)
//       .attr('height', ls_h)
//       .style('stroke', '#333')
//       .style('stroke-width', '1')
//       .style('fill', function (d, i) { return color_legend(d); })
//       .style('opacity', 0.8);

//     legend.append('text')
//       .attr('x', 850)
//       .attr('y', function (d, i) { return (height - (i * ls_h) - ls_h - 4) - 40; })
//       .text(function (d, i) { return legend_labels[i]; });


//     legend.append('text')
//       .attr('x', 835)
//       .attr('y', (height - (5.5 * ls_h) - ls_h - 4) - 40)
//       .text('Mortality Rate');

//     const color = d3.scaleQuantize<string>()
//                 .range(['#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'])
//                 .domain([2.5, 24.5]);

//     svg.selectAll('path')
//       .data(this.addValues())
//       .enter()
//       .append('path')
//       .attr('d', path)
//       .style('fill', function(d) {
//         const value = d['properties'].value;
//           if (value) {
//             return color(d['properties'].value);
//           } else {
//             return '#333';
//           }
//       })
//       .style('stroke', '#333')
//       .style('stroke-width', '1')
//       .classed('svg-content-responsive', true)
//       .on('mouseover', function(d) {
//         const xPosition = d3.mouse(this)[0];
//         const yPosition = d3.mouse(this)[1];

//         svg.selectAll('path')
//         .attr('d', path)
//         // tslint:disable-next-line:no-shadowed-variable
//         .style('fill', function(d) {
//           const value = d['properties'].value;
//             if (value) {
//               return color(d['properties'].value);
//             } else if (this) {
//               return color(value);
//             } else {
//               return '#333';
//             }
//         })
//         .style('opacity', '0.2');

//         d3.select(this)
//         .style('cursor', 'crosshair')
//         .style('stroke', '#333')
//         // tslint:disable-next-line:no-shadowed-variable
//         .style('fill', function(d) {
//           const value = d['properties'].value;
//             if (value) {
//               return color(d['properties'].value);
//             } else {
//               return '#333';
//             }
//         })
//         .style('opacity', '1')
//         .style('stroke-width', '4');

//           // Update the tooltip position and value
//           d3.select('#tooltip-map')
//           .style('position', 'absolute')
//           .style('left', function() {
//             if (width > 1000 && xPosition < 400) {
//               return xPosition + 'px';
//             } else if (width > 1000 && xPosition > 400) {
//               return xPosition + 'px';
//             } else {
//               return xPosition + 'px';
//             }
//           })
//           .style('top', function() {
//             if (yPosition > 200) {
//               return yPosition + 'px';
//             } else if (yPosition < 200) {
//               return yPosition + 'px';
//             } else {
//               return yPosition + 'px';
//             }
//           })
//           .select('#value-map')
//           .html('<h4 class =' + 'senator-name' + '>' + d['properties'].name + '</h4>' + '<hr>'
//           + '<div class = wrapper>' + '<div>' + '<img src = ' + d['properties'].flag_image_url + ' onerror' + '= No photo available' + '>'
//           + '</div>' + '<div>' + '<p class = ' + 'voting-info' + '>' + 'Mortality Rate: ' + '<strong>' + d['properties'].value + '%'
//           + '</strong>' + '</p>' + '<p class = ' + 'voting-info' + '>' + 'Total Deaths: ' + '<strong>' + d['properties'].deaths
//           + '</strong>' + '</p>' + '</div>' + '</div>'
//           );

//           d3.select('.tooltip-alt')
//           .html('<div class =' + 'child' + '>' + '<p class = ' + 'voting-info' + '>' + '<strong>' + d['properties'].name + '</strong>'
//           + '</p>' + '</div>'
//           + '<div class =' + 'child' + '>' + '<strong>' + 'Mortality Rate: ' + '</strong>' + d['properties'].value + '%' + '</div>');

//           // Show the tooltip
//           d3.select('#tooltip-map').classed('hidden', false);
//         })
//         .on('mouseout', function() {
//             d3.select('#tooltip-map').classed('hidden', true);

//             svg.selectAll('path')
//             .attr('d', path)
//             .style('fill', function(d) {
//               const value = d['properties'].value;
//                 if (value) {
//                   return color(d['properties'].value);
//                 } else {
//                   return '#333';
//                 }
//             })
//             .style('opacity', '1');

//             d3.select(this)
//               .style('stroke-width', '1')
//               .style('stroke', '#333');

//         });

//         d3.select('.tooltip-alt')
//         .html('<div class =' + 'child' + '>' + '<p class = ' + 'voting-info' + '>' + '<strong>' + '---' + '</strong>'
//         + '</p>' + '</div>'
//         + '<div class =' + 'child' + '>' + '<strong>' + 'Mortality Rate: ' + '</strong>' + '---' + '%' + '</div>');

//   }
// }
