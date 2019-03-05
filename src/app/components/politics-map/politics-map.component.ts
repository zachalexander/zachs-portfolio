import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as stateData from '../../../assets/us-states.json';
import * as stateFeatures from '../../../assets/us-state-features.json';
import 'rxjs/add/operator/filter';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ResizedEvent } from 'angular-resize-event/resized-event';

@Component({
  selector: 'app-politics-map',
  templateUrl: './politics-map.component.html',
  styleUrls: ['./politics-map.component.scss']
})

export class PoliticsMapComponent implements OnInit {
  innerWidth;
  width;
  mobile = false;

  constructor(
    private spinnerService: Ng4LoadingSpinnerService
  ) { }


  onResized(event: ResizedEvent): void {
    this.spinnerService.show();
    this.width = event.newWidth;

    setTimeout(() => {
        this.drawMap(this.width, 550);
        this.spinnerService.hide();
      }, 1000);

      if (this.width < 1300) {
        this.mobile = true;
      } else {
        this.mobile = false;
      }

  }

  ngOnInit() {

    this.spinnerService.show();

    this.innerWidth = window.innerWidth;
    setTimeout(() => {
      this.drawMap(this.innerWidth, 500);
      this.spinnerService.hide();
    }, 2000);

    if (this.innerWidth < 1200) {
      this.mobile = true;
    }


  }

addValues() {

  const stateDataset = stateData.default;

  d3.csv('../../../assets/firearm-deaths-2017.csv')
    .then(function(data) {
      data.forEach(element => {
        const dataState = element.state;
        const dataRate = parseFloat(element.rate);
        const dataDeaths = element.deaths;

        for (let i = 0; i < stateDataset.features.length; i++) {
          const jsonState = stateDataset.features[i].properties.name;

          if (dataState === jsonState) {
            stateDataset.features[i].properties['value'] = dataRate;
            stateDataset.features[i].properties.deaths = dataDeaths;
          }
        }
      });
    });

  stateDataset.features.map(data => {
    stateFeatures.default.map(features => {
      if (data.properties.name === features.state) {
        data.properties.map_image_url = features.map_image_url;
        data.properties.flag_image_url = features.state_flag_url;
      }
    });
  });

  return stateDataset.features;

}

  drawMap(width, height) {

    d3.select('svg').remove();

    const projection = d3.geoAlbersUsa();

    const path = d3.geoPath()
              .projection(projection);

    const ext_color_domain = [2.5, 5.5, 11.5, 20.5, 24.5];

    const color_domain = [2.5, 5.5, 11.5, 20.5, 24.5];

    const legend_labels = ['2.5% - 5.1%', '5.2% - 13.5%', '13.6% - 16.9%', '17.0% - 20.9%', '>21.0%'];

    const color_legend = d3.scaleLinear<string>()
      .range(['#f1eef6', '#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'])
      .domain(color_domain);

    const svg = d3.select('.graphic')
                .append('svg')
                .attr('class', 'map')
                .attr('x', 0)
                .attr('y', 0)
                .attr('viewBox', '-30 -20 1000 600')
                .attr('preserveAspectRatio', 'xMidYMid')
                .attr('width', width)
                .attr('height', height);

    const legend = svg.selectAll('g')
      .data(ext_color_domain)
      .classed('legend', true)
      .enter().append('g')
      .attr('class', 'legend');

    const ls_w = 20, ls_h = 20;

    legend.append('rect')
      .attr('x', 820)
      .attr('y', function (d, i) { return (height - (i * ls_h) - 2 * ls_h) - 40; })
      .attr('width', ls_w)
      .attr('height', ls_h)
      .style('stroke', '#333')
      .style('stroke-width', '1')
      .style('fill', function (d, i) { return color_legend(d); })
      .style('opacity', 0.8);

    legend.append('text')
      .attr('x', 850)
      .attr('y', function (d, i) { return (height - (i * ls_h) - ls_h - 4) - 40; })
      .text(function (d, i) { return legend_labels[i]; });


    legend.append('text')
      .attr('x', 835)
      .attr('y', (height - (5.5 * ls_h) - ls_h - 4) - 40)
      .text('Mortality Rate');

    const color = d3.scaleQuantize<string>()
                .range(['#f1eef6', '#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'])
                .domain([2.5, 24.5]);

    svg.selectAll('path')
      .data(this.addValues())
      .enter()
      .append('path')
      .attr('d', path)
      .style('fill', function(d) {
        const value = d['properties'].value;
          if (value) {
            return color(d['properties'].value);
          } else {
            return '#333';
          }
      })
      .style('stroke', '#333')
      .style('stroke-width', '1')
      .classed('svg-content-responsive', true)
      .on('mouseover', function(d) {
        const xPosition = d3.mouse(this)[0];
        const yPosition = d3.mouse(this)[1];

        svg.selectAll('path')
        .attr('d', path)
        // tslint:disable-next-line:no-shadowed-variable
        .style('fill', function(d) {
          const value = d['properties'].value;
            if (value) {
              return color(d['properties'].value);
            } else if (this) {
              return color(value);
            } else {
              return '#333';
            }
        })
        .style('opacity', '0.2');

        d3.select(this)
        .style('cursor', 'crosshair')
        .style('stroke', '#333')
        // tslint:disable-next-line:no-shadowed-variable
        .style('fill', function(d) {
          const value = d['properties'].value;
            if (value) {
              return color(d['properties'].value);
            } else {
              return '#333';
            }
        })
        .style('opacity', '1')
        .style('stroke-width', '4');

          // Update the tooltip position and value
          d3.select('#tooltip-map')
          .style('position', 'absolute')
          .style('left', function() {
            if (width > 1000 && xPosition < 400) {
              return xPosition + 250 + 'px';
            } else if (width > 1000 && xPosition > 400) {
              return xPosition + 100 + 'px';
            } else {
              return xPosition + 'px';
            }
          })
          .style('top', function() {
            if (yPosition > 200) {
              return yPosition - 200 + 'px';
            } else if (yPosition < 200) {
              return yPosition + 300 + 'px';
            } else {
              return yPosition + 'px';
            }
          })
          .select('#value-map')
          .html('<h4 class =' + 'senator-name' + '>' + d['properties'].name + '</h4>' + '<hr>'
          + '<div class = wrapper>' + '<div>' + '<img src = ' + d['properties'].flag_image_url + ' onerror' + '= No photo available' + '>'
          + '</div>' + '<div>' + '<p class = ' + 'voting-info' + '>' + 'Mortality Rate: ' + '<strong>' + d['properties'].value + '%'
          + '</strong>' + '</p>' + '<p class = ' + 'voting-info' + '>' + 'Total Deaths: ' + '<strong>' + d['properties'].deaths
          + '</strong>' + '</p>' + '</div>' + '</div>'
          );

          d3.select('.tooltip-alt')
          .html('<div class =' + 'child' + '>' + '<p class = ' + 'voting-info' + '>' + '<strong>' + d['properties'].name + '</strong>'
          + '</p>' + '</div>'
          + '<div class =' + 'child' + '>' + '<strong>' + 'Mortality Rate: ' + '</strong>' + d['properties'].value + '%' + '</div>');

          // Show the tooltip
          d3.select('#tooltip-map').classed('hidden', false);
        })
        .on('mouseout', function() {
            d3.select('#tooltip-map').classed('hidden', true);

            svg.selectAll('path')
            .attr('d', path)
            .style('fill', function(d) {
              const value = d['properties'].value;
                if (value) {
                  return color(d['properties'].value);
                } else {
                  return '#333';
                }
            })
            .style('opacity', '1');

            d3.select(this)
              .style('stroke-width', '1')
              .style('stroke', '#333');

        });

        d3.select('.tooltip-alt')
        .html('<div class =' + 'child' + '>' + '<p class = ' + 'voting-info' + '>' + '<strong>' + '---' + '</strong>'
        + '</p>' + '</div>'
        + '<div class =' + 'child' + '>' + '<strong>' + 'Mortality Rate: ' + '</strong>' + '---' + '%' + '</div>');

  }



}
