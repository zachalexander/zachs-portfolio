import { Component, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { PropubService } from '../../services/propub.service';
import * as senatorData from '../../../assets/us-senate.json';
import 'rxjs/add/operator/filter';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ResizedEvent } from 'angular-resize-event/resized-event';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './senate-votes.component.html',
  styleUrls: ['./senate-votes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SenateVotesComponent {
  width;
  height;
  initSrnSize;
  initSrnHei;
  members = [];
  membersSixteen = [];
  senatorPhotoUrls = [];
  senatorPhotoData = [];
  active_members: any;
  members_data = [];
  senators_data = [];
  republicanSenators = [];
  democraticSenators = [];
  dataset: Object;
  serverError = false;
  democraticChart = false;
  milliseconds: number;

  constructor(
    private propubService: PropubService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  onResized(event: ResizedEvent): void {
    this.width = event.newWidth;

    if (this.width >= 1000 && this.democraticChart === true) {
      const updatedWidth = 1000;
      d3.select('svg').remove();
      drawChart(this.democraticSenators, updatedWidth, 500, 'rgba(0, 143, 213, ');
    }

    if (this.width < 1000 && this.democraticChart === true) {
      const updatedWidth = this.width;
      d3.select('svg').remove();
      drawChart(this.democraticSenators, updatedWidth, 500, 'rgba(0, 143, 213, ');
    }

    if (this.width >= 1000 && this.democraticChart === false) {
      const updatedWidth = 1000;
      d3.select('svg').remove();
      drawChart(this.republicanSenators, updatedWidth, 500, 'rgba(255, 39, 0, ');
    }

    if (this.width < 1000 && this.democraticChart === false) {
      const updatedWidth = this.width;
      d3.select('svg').remove();
      drawChart(this.republicanSenators, updatedWidth, 500, 'rgba(255, 39, 0, ');
    }
  }

  tellTime() {
    this.milliseconds = Date.now();
    console.log(this.milliseconds);
  }

  propubServiceCall() {
    this.propubService.getPropublicaSixteen().subscribe(
      data => {this.membersSixteen = data.results[0].members; },
      err => {
        this.serverError = true;
        console.error(err);
      },
      () => {
        const sixteenCongress = this.membersSixteen;
        // console.log(sixteenCongress);
      }
    );
  }


  massageDataAndDrawChart(len, hei) {
    this.propubService.getPropublicaFifteen().subscribe(
      data => {this.members = data.results[0].members; },
      err => {
        this.serverError = true;
        console.error(err);
      },
      () => {
        const senatePhotosData = this.createSenatePhotoData();
        const active_members = [];
        this.republicanSenators = [];
        this.democraticSenators = [];

        // console.log(this.members);

        // massage data and merge two datasets
        senatePhotosData.map((photos) => {
          this.members.map((element) => {
            if (element.last_name === 'Kyl') {
              element.photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Jon_Kyl%2C' +
              '_official_109th_Congress_photo.jpg/480px-Jon_Kyl%2C_official_109th_Congress_photo.jpg';
            }
            if (element.last_name === 'Hyde-Smith') {
              element.photo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Cindy_Hyde-Smith_official_photo.jpg';
            }
            if (element.votesmart_id === photos.votesmart_id) {
              element.photo_url = photos.photo_url;
            }
          });
        });

        this.members.map(members => {
          if (members.in_office === false &&
              (members.last_name !== 'Cochran'
              && members.last_name !== 'McCain'
              && members.last_name !== 'Franken'
              && members.last_name !== 'Strange'
              && members.last_name !== 'Sessions')) {
            active_members.push({
              'senator_name': members.first_name + ' ' + members.last_name,
              'party': members.party,
              'state': members.state,
              'votes_w_prty_pct': members.votes_with_party_pct,
              'total_votes': members.total_votes,
              'missed_votes': members.missed_votes,
              'photo_url': members.photo_url
            });
          }
        });

        active_members.map(members => {
          if (members.party === 'R') {
              pushPartyData(members, this.republicanSenators);
            } else if (members.party === 'D') {
              pushPartyData(members, this.democraticSenators);
            } else if (members.party === 'I') {
              pushPartyData(members, this.democraticSenators);
            }
        });

        sortVotes(this.republicanSenators, 1, -1);
        sortVotes(this.democraticSenators, 1, -1);

        makeKey(this.republicanSenators);
        makeKey(this.democraticSenators);

        // remove existing chart if resize needed
        d3.select('svg').remove();

        const barColor = 'rgba(255, 39, 0, ';
        // draw chart
        drawChart(this.republicanSenators, len, hei, barColor);
        this.spinnerService.hide();
      }
    );
  }


  getSenatePhotoUrls() {
    this.senatorPhotoUrls = senatorData.default;
    return this.senatorPhotoUrls;
  }

  createSenatePhotoData() {
    const senatorPhotoUrls = this.getSenatePhotoUrls();
    senatorPhotoUrls.map((members) => {
      this.senatorPhotoData.push({
        'votesmart_id': members.votesmart,
        'name': members.name,
        'photo_url': members.photo_url
      });
    });
    return this.senatorPhotoData;
  }

  drawDemChart() {
    this.democraticChart = false;
    this.initSrnSize = window.innerWidth;
    const barColor = 'rgba(255, 39, 0, ';
    d3.select('svg').remove();

    if (this.width >= 1000) {
      const updatedWidth = 1000;
      drawChart(this.republicanSenators, updatedWidth, 500, barColor);
    } else {
      const updatedWidth = this.width;
      drawChart(this.republicanSenators, updatedWidth, 500, barColor);
    }
  }

  drawRepChart() {
    this.democraticChart = true;
    this.initSrnSize = window.innerWidth;
    const barColor = 'rgba(0, 143, 213, ';
    d3.select('svg').remove();

    if (this.width >= 1000) {
      const updatedWidth = 1000;
      drawChart(this.democraticSenators, updatedWidth, 500, barColor);
    } else {
      const updatedWidth = this.width;
      drawChart(this.democraticSenators, updatedWidth, 500, barColor);
    }
  }

  // =============On Init============= //

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnInit() {
      this.spinnerService.show();
      const initSrnSize = window.innerWidth;

      this.getSenatePhotoUrls();
      this.propubServiceCall();

      if (initSrnSize >= 1000) {
        const updatedWidth = 1000;
        d3.select('svg').remove();
        this.massageDataAndDrawChart(updatedWidth, 500);
      }

      if (initSrnSize < 1000) {
        const updatedWidth = initSrnSize;
        d3.select('svg').remove();
        this.massageDataAndDrawChart(updatedWidth, 500);
      }

      setInterval(() => {
        this.milliseconds = Date.now();
      }, 1000);
    }
    // end of ngOnInit

  }
// end of export class AppComponent


// =========== DATA MANIPULATION FUNCTIONS =========== //

    // sort votes function
    function sortVotes(dataset, reverseOrder1, reverseOrder2) {
      dataset.sort(function(a, b) {
        const nameA = a.votes_w_prty_pct;
        const nameB = b.votes_w_prty_pct;
        if (nameA < nameB) {return reverseOrder1; }
        if (nameA > nameB) {return reverseOrder2; }
        return 0;
      });
    }

    // insert key into dataset
    function makeKey(dataset) {dataset.map((x, index) => {x.key = index; }); }

    // push data to appropriate dataset
    function pushPartyData(senatorToken, dataset) {
      dataset.push({
        'key': dataset.index,
        'senator_name': senatorToken.senator_name,
        'party': senatorToken.party,
        'state': senatorToken.state,
        'votes_w_prty_pct': senatorToken.votes_w_prty_pct,
        'total_votes': senatorToken.total_votes,
        'missed_votes': senatorToken.missed_votes,
        'photo_url': senatorToken.photo_url
      });
    }

    function drawChart(dataset1, len, hei, barColor) {

      const margin = {top: 10, right: 20, bottom: 170, left: 20};

      len = len - margin.left - margin.right,
      hei = hei - margin.top - margin.bottom;

      // set scales for bars
      const repXScale = d3.scaleBand()
                          .rangeRound([margin.right, len - margin.right])
                          .padding(0.1);
      repXScale.domain(d3.range(dataset1.length).map((d) => d + ''));


      const repYScale = d3.scaleLinear().range([0, hei]);
      repYScale.domain([70, 100]);

      // create main svg
      const svg = d3.select('.chart-wrapper')
                  .append('svg')
                  .attr('width', len + margin.left + margin.right)
                  .attr('height', hei + margin.top + margin.bottom)
                  .append('g').classed('overall-div', true)
                  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // create svgs for both sides of bar graph
      const repSenators = svg.append('g')
                           .classed('republican-senators', true)
                           .attr('transform', 'translate(0,0)');

      const repXScaleBottom = d3.scaleBand().rangeRound([margin.right, len - margin.right]).padding(0.10);
      repXScaleBottom.domain(dataset1.map(function (d) {return d.senator_name; }));

      const repYScaleLeft = d3.scaleLinear().range([hei, 0]);
      repYScaleLeft.domain([70, 100]);

      const xAxisRep = d3.axisBottom(repXScaleBottom).ticks(repXScaleBottom).tickSizeOuter(0);

      const yAxisRep = d3.axisLeft(repYScaleLeft).ticks(8).tickSizeOuter(1);

      repSenators.append('g')
        .attr('class', 'x-axis-rep')
        .attr('transform', 'translate(0,' + hei + ')')
        .call(xAxisRep)
        .selectAll('text')
        .attr('transform', 'rotate(-60)')
        .attr('y', 5)
        .attr('x', -8)
        .attr('dy', '.35em')
        .style('fill', 'rgb(124,124,124')
        .style('text-anchor', 'end');

      repSenators.append('g')
        .attr('class', 'y-axis-rep')
        .attr('transform', 'translate(' + margin.right + ',0)')
        .style('fill', 'rgb(124,124,124')
        .call(yAxisRep);


      // append the bars for republican senators
      repSenators.selectAll('rect')
                  .data(dataset1)
                  .enter()
                  .append('rect')
                  .attr('x', function(d, i) {
                    const index = i.toString();
                    return repXScale(index);
                  })
                  .attr('y', function(d) {return hei - repYScale(d['votes_w_prty_pct']); })
                  .attr('width', repXScale.bandwidth())
                  .attr('height', function(d) {return repYScale(d['votes_w_prty_pct']); })
                  .attr('fill', function(d) {return barColor + (0.6 - (d['key'] / 100)) + ')'; })
                  .call(function() {
                    d3.select('#tooltip')
                      .style('left', 20 + 'px')
                      .style('top', 0 + 'px')
                      .select('#value')
                      .html('<h4 class = senator-name >' + '---' + '</h4>');
                  })
                  .on('mouseover', function(d) {
                    const xPosition = parseFloat(d3.select(this).attr('x')) + repXScale.bandwidth();
                    const yPosition = parseFloat(d3.select(this).attr('y')) + 300;
                    repSenators.selectAll('rect')
                              // tslint:disable-next-line:no-shadowed-variable
                              .attr('fill', function (d) {return barColor + (0.6 - (d['key'] / 100)) * 0.4 + ')'; });
                    d3.select(this)
                      // tslint:disable-next-line:no-shadowed-variable
                      .attr('fill', function (d) {return barColor + (0.6 - (d['key'] / 100)) + ')'; })
                      .style('cursor', 'crosshair');

                    // Update the tooltip position and value
                    d3.select('#tooltip')
                    .style('left', 20 + 'px')
                    .style('top', 0 + 'px')
                    .select('#value')
                    .html('<h4 class =' + 'senator-name' + '>' + d['senator_name'] + ' ' + '(' + d['state'] + ')' + '</h4>' + '<hr>'
                      + '<p class = ' + 'voting-info' + '>' + 'Percent Vote With Party: ' + '<span class =' + 'vote-percent' + '>'
                      + '<strong>' + d['votes_w_prty_pct'].toFixed(1) + '%' + '<strong>' + '</span>' + '</p>' + '<hr>'
                      + '<div class = wrapper>' + '<div>' + '<img src = ' + d['photo_url'] + ' onerror' + '= No photo available' + '>'
                      + '</div>' + '<div>' + '<p class = ' + 'voting-info' + '>' + 'Total Votes: ' + '<strong>' + d['total_votes']
                      + '</strong>' + '</p>' + '<p class = ' + 'voting-info' + '>' + 'Missed Votes: ' + '<strong>' + d['missed_votes']
                      + '</strong>' + '</p>' + '</div>' + '</div>'
                    );

                    // Show the tooltip
                    d3.select('#tooltip').classed('hidden', false); })
                      .on('mouseout', function() {
                          d3.select('#tooltip');
                          repSenators.selectAll('rect')
                                      .attr('fill', function (d) {return barColor + (0.6 - (d['key'] / 100)) + ')'; });
                          d3.select(this)
                            .attr('fill', function(d, i) {return barColor + (0.6 - (d['key'] / 100)) + ')'; });
                      });

      }






