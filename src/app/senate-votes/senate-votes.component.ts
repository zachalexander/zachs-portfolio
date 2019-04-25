import { Component, ViewEncapsulation } from '@angular/core';
import { PropubService } from './../services/propub.service';
import { CongressData } from './../shared/interfaces/congressdata';
import * as d3 from 'd3';
import 'rxjs/add/operator/filter';
import { ResizedEvent } from 'angular-resize-event';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './senate-votes.component.html',
  styleUrls: ['./senate-votes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SenateVotesComponent {
  width;
  initSrnSize;
  initSrnHei;
  members = [];
  members_data = [];
  senators_data = [];
  republicanSenators = [];
  democraticSenators = [];
  photoData = [];
  senatorPhotosData;
  active_members: any;
  dataset: Object;
  serverError = false;
  democraticChart = false;
  mobile = false;
  errorMessage = '';
  congressdata: CongressData;
  clickedValue;
  clicked = false;
  democratsDropdown;
  republicansDropdown;

  percentParty;
  loyaltyRank;
  state;
  party;
  missedVotes;
  totalVotes;
  text;


  defaultMobileData = [
    {
      key: 0,
      senator_name: 'Perfectly Loyal Senator',
      votes_w_prty_pct: 100
    },
    {
      key: 1,
      senator_name: 'Pick a Senator',
      votes_w_prty_pct: 93.4
    }
  ];

  constructor(
    private propubService: PropubService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {}

  onResized(event: ResizedEvent): void {

    if (this.width < 600) {
      this.mobile = true;
    }

    if (this.width >= 600) {
      this.mobile = false;
    }

    this.width = event.newWidth;
    if (this.width >= 1000 && this.democraticChart === true) {
      const updatedWidth = 1000;
      d3.select('svg').remove();
      this.drawChart(this.democraticSenators, updatedWidth, 500, 'rgba(0, 143, 213, ', this.mobile);
    }

    if (this.width < 1000 && this.width >= 600 && this.democraticChart === true) {
      const updatedWidth = this.width;
      d3.select('svg').remove();
      this.drawChart(this.democraticSenators, updatedWidth, 500, 'rgba(0, 143, 213, ', this.mobile);
    }

    if (this.width >= 1000 && this.democraticChart === false) {
      const updatedWidth = 1000;
      d3.select('svg').remove();
      this.drawChart(this.republicanSenators, updatedWidth, 500, 'rgba(255, 39, 0, ', this.mobile);
    }

    if (this.width < 1000 && this.width >= 600 && this.democraticChart === false) {
      const updatedWidth = this.width;
      d3.select('svg').remove();
      this.drawChart(this.republicanSenators, updatedWidth, 500, 'rgba(255, 39, 0, ', this.mobile);
    }
  }

  returnPropubData(len, hei) {
    this.propubService.searchPropubData()
    .subscribe(
      (data) => {
        this.manipulateDataDrawChart(data, len, hei);
      },
      (error) => this.serverError = true,
    );
  }

  manipulateDataDrawChart(senatorData, len, hei) {
    this.propubService.searchSenatorPhotos()
    .subscribe(
      data => {
        this.members = senatorData.results[0].members;
        this.senatorPhotosData = data;
      },
      error => {
        this.serverError = true;
        console.error(error);
      },
      () => {
        const active_members = [];
        this.republicanSenators = [];
        this.democraticSenators = [];
        const senPhotos = this.createSenatePhotoData(this.senatorPhotosData);

        // merge two datasets
        senPhotos.map((photos) => {
          this.members.map((element) => {
            if (element.last_name === 'Kyl') {
              element.photo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/' +
              '6/61/Jon_Kyl%2C_official_109th_Congress_photo.jpg/480px-Jon_Kyl%2C_official_109th_Congress_photo.jpg';
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
          if (members.in_office === false && (members.last_name !== 'Cochran' && members.last_name !== 'McCain'
          && members.last_name !== 'Franken' && members.last_name !== 'Strange' && members.last_name !== 'Sessions')) {
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

        const dataToDraw = this.manipulateData(active_members);

        if (this.mobile) {
          this.democratsDropdown = this.democraticSenators.sort((a, b) => (a.state > b.state) ? 1 : -1)
          this.republicansDropdown = this.republicanSenators.sort((a, b) => (a.state > b.state) ? 1 : -1)
        }

        this.drawInitialChart(len, hei); {
          d3.select('svg').remove();
          const barColor = 'rgba(255, 39, 0, ';
          this.drawChart(dataToDraw[0], len, hei, barColor, this.mobile);
          this.spinnerService.hide();
        }
      });
  }

  drawDemChart() {
    this.democraticChart = false;
    this.initSrnSize = window.innerWidth;
    const barColor = 'rgba(255, 39, 0, ';
    d3.select('svg').remove();

    if (this.width >= 1000) {
      const updatedWidth = 1000;
      this.drawChart(this.republicanSenators, updatedWidth, 500, barColor, this.mobile);
    } else {
      const updatedWidth = this.width;
      this.drawChart(this.republicanSenators, updatedWidth, 500, barColor, this.mobile);
    }
  }

  drawRepChart() {
    this.democraticChart = true;
    this.initSrnSize = window.innerWidth;
    const barColor = 'rgba(0, 143, 213, ';
    d3.select('svg').remove();

    if (this.width >= 1000) {
      const updatedWidth = 1000;
      this.drawChart(this.democraticSenators, updatedWidth, 500, barColor, this.mobile);
    } else {
      const updatedWidth = this.width;
      this.drawChart(this.democraticSenators, updatedWidth, 500, barColor, this.mobile);
    }
  }

//   // =============On Init============= //

// tslint:disable-next-line: use-life-cycle-interface
    ngOnInit() {
      this.spinnerService.show();
      const initSrnSize = window.innerWidth;

      if (initSrnSize >= 1000) {
        const updatedWidth = 1000;
        d3.select('svg').remove();
        this.returnPropubData(updatedWidth, 500);
      }

      if (initSrnSize < 1000 && initSrnSize >= 600) {
        const updatedWidth = initSrnSize;
        d3.select('svg').remove();
        this.returnPropubData(updatedWidth, 500);
      }

      if (initSrnSize < 600) {
        const updatedWidth = initSrnSize;
        d3.select('svg').remove();
        this.returnPropubData(updatedWidth, 400);
      }

    }

// =========== DATA MANIPULATION FUNCTIONS =========== //

manipulateData(originalData) {
  const republicans = this.splitRepublicanData(originalData);
  const democrats = this.splitDemocraticData(originalData);
  const republicanSorted = this.sortSenatorData(republicans);
  const democratSorted = this.sortSenatorData(democrats);
  this.makeKey(republicanSorted);
  this.makeKey(democratSorted);
  this.republicanSenators = republicanSorted;
  this.democraticSenators = democratSorted;
  return [this.republicanSenators, this.democraticSenators];
}

drawInitialChart(len, hei) {
  d3.select('svg').remove();
  const barColor = 'rgba(255, 39, 0, ';
  this.drawChart(this.republicanSenators, len, hei, barColor, this.mobile);
  this.spinnerService.hide();
}

sortSenatorData(dataset) {
  this.sortVotes(dataset, 1, -1);
  return dataset;
}

splitRepublicanData(output) {
  output.map(members => {
    if (members.party === 'R') {
      this.pushPartyData(members, this.republicanSenators);
    }
  });
  return this.republicanSenators;
}

splitDemocraticData(output) {
  output.map(members => {
    if (members.party === 'D') {
      this.pushPartyData(members, this.democraticSenators);
    } else if (members.party === 'I') {
      this.pushPartyData(members, this.democraticSenators);
    }
  });
  return this.democraticSenators;
}

// sort votes function
sortVotes(dataset, reverseOrder1, reverseOrder2): void {
  dataset.sort(function(a, b) {
    const nameA = a.votes_w_prty_pct;
    const nameB = b.votes_w_prty_pct;
    if (nameA < nameB) {return reverseOrder1; }
    if (nameA > nameB) {return reverseOrder2; }
    return 0;
  });
}

// insert key into dataset
makeKey(dataset): void {dataset.map((x, index) => {x.key = index; }); }

// push data to appropriate dataset
pushPartyData(dataset, output): void {
  output.push({
    'key': dataset.index,
    'senator_name': dataset.senator_name,
    'party': dataset.party,
    'state': dataset.state,
    'votes_w_prty_pct': dataset.votes_w_prty_pct,
    'total_votes': dataset.total_votes,
    'missed_votes': dataset.missed_votes,
    'photo_url': dataset.photo_url
  });
  return output;
}

createSenatePhotoData(dataset) {
  dataset.map((members) => {
    this.photoData.push({
      'votesmart_id': members.votesmart,
      'name': members.name,
      'photo_url': members.photo_url
    });
  });
  return this.photoData;
}

drawChart(dataset, len, hei, barColor, mobile) {

  const margin = {top: 10, right: 20, bottom: 170, left: 20};

  len = len - margin.left - margin.right,
  hei = hei - margin.top - margin.bottom;

  // set scales for bars
  const XScale = d3.scaleBand().rangeRound([margin.right, len - margin.right]).padding(0.1);
  XScale.domain(d3.range(dataset.length).map((d) => d + ''));

  const YScale = d3.scaleLinear().range([0, hei]);
  YScale.domain([70, 100]);

  // create main svg
  const svg = d3.select('.chart-wrapper')
              .append('svg')
              .attr('width', len)
              .attr('height', hei + margin.top + margin.bottom)
              .append('g').classed('overall-div', true)
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // create svgs for bar graph
  const senators = svg.append('g')
                        .classed('senators', true)
                        .attr('transform', 'translate(0,0)');

  const XScaleBottom = d3.scaleBand().rangeRound([margin.right, len - margin.right]).padding(0.10);
  XScaleBottom.domain(dataset.map(function (d) {return d.senator_name; }));

  const YScaleLeft = d3.scaleLinear().range([hei, 0]);
  YScaleLeft.domain([70, 100]);

  const xAxis = d3.axisBottom(XScaleBottom).ticks(XScaleBottom).tickSizeOuter(0);

  const yAxis = d3.axisLeft(YScaleLeft).ticks(8).tickSizeOuter(1);

  senators.append('g')
    .attr('class', 'x-axis-rep')
    .attr('transform', 'translate(0,' + hei + ')')
    .call(xAxis)
    .selectAll('text')
    .attr('transform', 'rotate(-60)')
    .attr('y', 5)
    .attr('x', -8)
    .attr('dy', '.35em')
    .style('fill', 'rgb(124,124,124')
    .style('text-anchor', 'end');

  senators.append('g')
    .attr('class', 'y-axis-rep')
    .attr('transform', 'translate(' + margin.right + ',0)')
    .style('fill', 'rgb(124,124,124')
    .call(yAxis);

  // append the bars for senators
  senators.selectAll('rect')
              .data(dataset)
              .enter()
              .append('rect')
              .attr('x', function(d, i) {
                const index = i.toString();
                return XScale(index);
              })
              .attr('y', function(d) {return hei - YScale(d['votes_w_prty_pct']); })
              .attr('width', XScale.bandwidth())
              .attr('height', function(d) {return YScale(d['votes_w_prty_pct']); })
              .attr('fill', function(d) {return barColor + (0.6 - (d['key'] / 100)) + ')'; })
              .call(function() {
                if (!mobile) {
                  d3.select('#tooltip')
                    .style('left', 20 + 'px')
                    .style('top', 0 + 'px')
                    .select('#value')
                    .html('<h5 class =' + 'senator-name' + '>' + '---' + ' ' + '(' + '---' + ')' + '</h5>' + '<hr>'
                      + '<p class = ' + 'voting-info' + '>' + 'Percent Vote With Party: ' + '<span class =' + 'vote-percent' + '>'
                      + '<strong>' + '---' + '%' + '<strong>' + '</span>' + '</p>' + '<hr>'
                      + '<div class = tooltip-wrapper>' + '<div>' + '<p>' + '---' + '</p>' + '</div>'
                      + '<div>' + '<p class = ' + 'voting-info' + '>' + 'Total Votes: ' + '<strong>' + '---' + '</strong>' + '</p>'
                      + '<p class = ' + 'voting-info' + '>' + 'Missed Votes: ' + '<strong>' + '---'
                      + '</strong>' + '</p>' + '</div>' + '</div>'
                    );
                }
              })
              .on('mouseover', function(d) {
                const xPosition = parseFloat(d3.select(this).attr('x')) + XScale.bandwidth();
                const yPosition = parseFloat(d3.select(this).attr('y')) + 300;
                senators.selectAll('rect')
                          // tslint:disable-next-line:no-shadowed-variable
                          .attr('fill', function (d) {return barColor + (0.6 - (d['key'] / 100)) * 0.4 + ')'; });
                d3.select(this)
                  // tslint:disable-next-line:no-shadowed-variable
                  .attr('fill', function (d) {return barColor + (0.6 - (d['key'] / 100)) + ')'; })
                  .style('cursor', 'crosshair');

                if (!mobile) {
                  // Update the tooltip value
                  d3.select('#tooltip')
                    .style('left', 20 + 'px')
                    .style('top', 0 + 'px')
                    .select('#value')
                    .html('<h5 class =' + 'senator-name' + '>' + d['senator_name'] + ' ' + '(' + d['state'] + ')' + '</h5>' + '<hr>'
                      + '<p class = ' + 'voting-info' + '>' + 'Percent Vote With Party: ' + '<span class =' + 'vote-percent' + '>'
                      + '<strong>' + d['votes_w_prty_pct'].toFixed(1) + '%' + '<strong>' + '</span>' + '</p>' + '<hr>'
                      + '<div class = tooltip-wrapper>' + '<div class = ' + 'photo' + '>' + '<img src = ' + d['photo_url'] + '>'
                      + '</div>' + '<div>' + '<p class = ' + 'voting-info' + '>' + 'Total Votes: '
                      + '<strong>' + d['total_votes'] + '</strong>' + '</p>'
                      + '<p class = ' + 'voting-info' + '>' + 'Missed Votes: ' + '<strong>' + d['missed_votes']
                      + '</strong>' + '</p>' + '</div>' + '</div>'
                    );
                  // Show the tooltip
                  d3.select('#tooltip').classed('hidden', false);
                }
                })
                .on('mouseout', function() {
                    d3.select('#tooltip');
                    senators.selectAll('rect')
                                .attr('fill', function (d) {return barColor + (0.6 - (d['key'] / 100)) + ')'; });
                    d3.select(this)
                      .attr('fill', function(d, i) {return barColor + (0.6 - (d['key'] / 100)) + ')'; });
                });

  }

    storeName(event) {
      let value = event.srcElement.innerText;
      value = value.substring(0, value.length - 5);
      this.clickedValue = value;
      this.clicked = true;

      document.getElementById('senatorTable').scrollIntoView({behavior: 'smooth', block: 'center', inline: 'nearest'});

      if (!this.democraticChart) {
        this.republicanSenators.map(senators => {
          if (senators.senator_name === this.clickedValue) {
            this.percentParty = senators.votes_w_prty_pct;
            this.loyaltyRank = senators.key + 1;
            this.missedVotes = senators.missed_votes;
            this.totalVotes = senators.total_votes;
            this.state = senators.state;
            this.party = 'Republican';
          }
        })
      }

      if (this.democraticChart) {
        this.democraticSenators.map(senators => {
          if (senators.senator_name === this.clickedValue) {
            this.percentParty = senators.votes_w_prty_pct;
            this.loyaltyRank = senators.key + 1;
            this.missedVotes = senators.missed_votes;
            this.totalVotes = senators.total_votes;
            this.state = senators.state;
            this.party = 'Democrat';
          }
        })
      }

      if (this.loyaltyRank < 10) {
        this.text = 'This indicates that the Senator was very loyal to the party, and did not stray far from the party consensus on votes.'
      }

      if (this.loyaltyRank >= 10 && this.loyaltyRank < 35) {
        this.text = 'This indicates that the Senator was quite loyal to their party, but would occassionally '
        + 'stray from the party consensus on a vote.'
      }

      if (this.loyaltyRank >= 35 && this.loyaltyRank < 51) {
        this.text = 'This indicates that the Senator went against party consensus more regularly than most.'
      }

      if (this.clickedValue === 'Rand Paul' || this.clickedValue === 'Joe Manchin') {
        this.text = 'This Senator was the least loyal to their party.'
      }
    }
  }
