import { Component, OnInit, ViewEncapsulation  } from '@angular/core';
import * as d3 from 'd3';
import 'rxjs/add/operator/filter';

interface ChartData {
  xVal: number;
  yVal: number;
}

// Get the data
const data = [
  {
    'xVal': 0,
    'yVal': 2
  },
  {
    'xVal': 1,
    'yVal': 18
  },
  {
    'xVal': 2,
    'yVal': 45
  },
  {
    'xVal': 3,
    'yVal': 37
  },
  {
    'xVal': 4,
    'yVal': 23
  },
  {
    'xVal': 5,
    'yVal': 46
  },
  {
    'xVal': 6,
    'yVal': 15
  },
  {
    'xVal': 7,
    'yVal': 8
  },
  {
    'xVal': 8,
    'yVal': 31
  },
  {
    'xVal': 9,
    'yVal': 13
  },
  {
    'xVal': 10,
    'yVal': 41
  }
];


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    setInterval(() => {
      const newData = this.transformData(data);
      this.drawLineChart(newData);
    }, 1000);
    this.drawLineChart(data);
  }

  drawLineChart(data) {

    d3.select('svg').remove();

    let len = 600;
    let hei = 600;

    const margin = {top: 120, right: 50, bottom: 80, left: 50};

    len = len - margin.left - margin.right,
    hei = hei - margin.top - margin.bottom;

    const x = d3.scaleLinear().range([margin.left, len - margin.left]);
    const y = d3.scaleLinear().range([hei - margin.top - margin.bottom, 0]);

      // Scale the range of the data
      x.domain(d3.extent(data, function (d: ChartData) {
              return d['xVal'];
          }));
      y.domain([0, d3.max(data, function (d: ChartData) {
                  return d['yVal'];
              })
      ]);

    const xAxis = d3.axisBottom(x)
                    .scale(x)
                    .tickSizeOuter(1);

    const yAxis = d3.axisLeft(y)
                    .scale(y)
                    .tickSizeOuter(1);

    const valueline = d3.line<ChartData>()
        .x((d: ChartData) => {
            return x(d['xVal']);
        })
        .y((d: ChartData) => {
            return y(d['yVal']) + margin.top + margin.bottom;
        });

    const svg = d3.select('._graphic-1')
        .append('svg')
        .attr('width', len + margin.left + margin.right)
        .attr('height', hei + margin.top + margin.bottom)
        .append('g');



    svg.append('path') // Add the valueline path.
        .datum(data)
        .attr('d', valueline(data));

    svg.append('g') // Add the X Axis
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + hei + ')')
        .call(xAxis);

    svg.append('g') // Add the Y Axis
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + margin.left + ',' + (margin.top + margin.bottom) + ')')
        .call(yAxis);

  }

  transformData(data) {
    const num = Math.floor(Math.random() * 50) + 1;
    data.map((elements, index) => {
      if (index === 0) {
        elements['yVal'] = num;
      } else {
        elements['yVal'] = Math.floor((Math.random() * 50) + 1);
      }
    });
    return data;
  }
}
