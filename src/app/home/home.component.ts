import { Component, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { database } from 'firebase';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class HomeComponent implements OnInit {

  dataset = [
    {
      'key': 0,
      'value': 2
    },
    {
      'key': 1,
      'value': 4
    },
    {
      'key': 2,
      'value': 2
    },
    {
      'key': 3,
      'value': 1
    },
    {
      'key': 4,
      'value': 8
    },
    {
      'key': 5,
      'value': 3
    },
    {
      'key': 6,
      'value': 6
    },
    {
      'key': 7,
      'value': 5
    },
    {
      'key': 8,
      'value': 1
    },
    {
      'key': 9,
      'value': 2
    }
  ];

  model = {
      left: true,
      middle: false,
      right: false
  };

    currentState = 'initial';

    focus;
    focus1;
    constructor() { }

    scrollToDescript() {
      document.getElementById('explainer').scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
    }

    scrollToList() {
      document.getElementById('viz-list').scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});
    }

    ngOnInit() {
      setInterval(() => {
        let len = window.innerWidth;
        if (len > 600) {
          len = 600;
          const newData = this.fluctuatingData(this.dataset);
          this.drawfluxBar(newData, len, 400)
        } else {
          const newData = this.fluctuatingData(this.dataset);
          this.drawfluxBar(newData, len, 250)
        }
      }, 1000);
      let len = window.innerWidth;
      if (len > 600) {
        len = 600;
        this.drawfluxBar(this.dataset, len, 400);
      } else {
        this.drawfluxBar(this.dataset, len, 250);
      }

    }

    drawfluxBar(dataset, len, hei) {

      d3.select('svg').remove();

      const margin = {top: 40, right: 40, bottom: 40, left: 40};

      len = len - margin.left - margin.right,
      hei = hei - margin.top - margin.bottom;

      // set scales for bars
      const XScale = d3.scaleBand().rangeRound([margin.right , len - margin.right]).padding(0.1);
      XScale.domain(d3.range(dataset.length).map((d) => d + ''));

      const YScale = d3.scaleLinear().range([0, hei]);
      YScale.domain([0, 11]);

      // create main svg
      const svg = d3.select('.chart-wrapper')
                  .append('svg')
                  .attr('width', len + margin.left + margin.right)
                  .attr('height', hei + margin.top + margin.bottom)
                  .append('g').classed('overall-div', true);

        // create svgs for bar graph
      const bars = svg.append('g')
                          .classed('bars', true)
                          .attr('transform', 'translate(' + margin.right + ',' + margin.top + ')');

      // const xAxis = d3.axisBottom(XScale).ticks(0);

      const yAxis = d3.axisLeft(YScale)
                      .ticks(0);

      // bars.append('g')
      //   .attr('class', 'x-axis-line')
      //   .attr('transform', 'translate(0,' + hei + ')')
      //   .call(xAxis)

      bars.append('g')
        .attr('class', 'y-axis-line')
        .attr('transform', 'translate(' + margin.right + ',0)')
        .call(yAxis);

      // append the bars for senators
      bars.selectAll('rect')
              .data(dataset)
              .enter()
              .append('rect')
              .attr('x', function(d, i) {
                const index = i.toString();
                return XScale(index);
              })
              .attr('y', function(d) {return hei - YScale(d['value']); })
              .attr('width', XScale.bandwidth())
              .attr('height', function(d) {return YScale(d['value']); })
              .attr('fill', '#333')
              .attr('stroke-width', '2')
    }

    fluctuatingData(dataset) {
        dataset.map(data => {
          data['value'] = (Math.round(Math.random() * 10) + 1);
        });
        return dataset;
    }
}
