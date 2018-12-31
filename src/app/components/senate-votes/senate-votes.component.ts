import { Component, ViewEncapsulation } from '@angular/core';
import * as d3 from "d3";
import { PropubService } from '../../services/propub.service';
import * as senatorData from '../../../assets/us-senate.json';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'app-root',
  templateUrl: './../../app.component.html',
  styleUrls: ['./../../app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SenateVotesComponent {
  title = 'd3-chart-practice';
  members;
  members_data = [];
  senators_data = [];
  republicanSenators = [];
  democraticSenators = [];
  independentSenators = [];
  senatorSup = [];
  dataset: Object;

  constructor(
    private propubService: PropubService
  ){}

  ngOnInit(){

    // svg dimensions
    let len = 1200;
    let hei = 400;
    let padding_length = 20;
    let padding_height = 140;
    let padding_top = 20;

    // sort votes function
    function sortVotes(dataset, reverseOrder1, reverseOrder2){
      dataset.sort(function(a, b){
        let nameA = a.votes_w_prty_pct;
        let nameB = b.votes_w_prty_pct;
        if (nameA < nameB) {return reverseOrder1;}
        if (nameA > nameB){return reverseOrder2;}
        return 0;
      });
    }

    function photoReplace (dataset) {
      dataset.map((element) => {
        if (element.photo_url == undefined && element.senator_name === "Cindy Hyde-Smith") {
          element.photo_url = "https://upload.wikimedia.org/wikipedia/commons/d/d7/Cindy_Hyde-Smith_official_photo.jpg"
        } else if (element.photo_url == undefined && element.senator_name === "Jon Kyl") {
          element.photo_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Jon_Kyl%2C_official_109th_Congress_photo.jpg/480px-Jon_Kyl%2C_official_109th_Congress_photo.jpg"
        } else {
          element.photo_url = element.photo_url
        }
      })
    }

    // insert key into dataset
    function makeKey(dataset) {dataset.map((x, index) => {x.key = index;})}

    // push data to appropriate dataset
    function pushPartyData(senatorToken, dataset) {
      dataset.push({
        "key": dataset.index,
        "senator_name": senatorToken.senator_name,
        "party": senatorToken.party,
        "state": senatorToken.state,
        "votes_w_prty_pct": senatorToken.votes_w_prty_pct,
        "total_votes": senatorToken.total_votes,
        "missed_votes": senatorToken.missed_votes,
        "photo_url": senatorToken.photo_url
      })
    }

    // grab data from service
      this.propubService.getPropublica().subscribe(
          data => {
            this.members = data.results[0].members;
            console.log(this.members);
            let senatorPhotos = senatorData.default;
            console.log(senatorPhotos);
            senatorPhotos.map((names) => {
              this.senatorSup.push({
                "votesmart_id": names.votesmart,
                "name": names.name,
                "photo_url": names.photo_url,
              })
            })

          this.senatorSup.map((supelement) => {
            this.members.map((element) => {
              if (element.votesmart_id === supelement.votesmart_id){
                element.photo_url = supelement.photo_url;
              }
            })
          })
          },
          err => {
            console.error(err)
          },
          () => {
              this.members.map((names, index) => {
                if(names.in_office === true){
                    this.members_data.push({
                        "senator_name": names.first_name + " " + names.last_name,
                        "party": names.party,
                        "state": names.state,
                        "votes_w_prty_pct": names.votes_with_party_pct,
                        "total_votes": names.total_votes,
                        "missed_votes": names.missed_votes,
                        "photo_url": names.photo_url
                    })
                }
              });

              console.log(this.members_data);
            // Data manipulation, separating into party datasets and sorting based on voting percentage
             this.members_data.map((x) => {
                if(x.party === "R"){
                  pushPartyData(x, this.republicanSenators)
                } else if (x.party === "D"){
                  pushPartyData(x, this.democraticSenators)
                } else if (x.party === "I"){
                  pushPartyData(x, this.democraticSenators)
                }
              });

            sortVotes(this.republicanSenators, 1, -1);
            sortVotes(this.democraticSenators, -1, 1);

            let republicans = this.republicanSenators;
            let democrats = this.democraticSenators;

            console.log(republicans);
            console.log(democrats);

            // add key property to datasets for bar coloring purposes
            makeKey(republicans);
            makeKey(democrats);

            photoReplace(republicans);
            photoReplace(democrats);

            // set scales for bars
            let repXScale = d3.scaleBand()
                          .domain(d3.range(republicans.length))
                          // .rangeRoundBands([5, republicans.length / 100 * len], 0.10)

            let repYScale = d3.scaleLinear()
                          .domain([40, d3.max(republicans, function(d){ return d.votes_w_prty_pct;})])
                          .range([0, hei - padding_top])

            let demXScale = d3.scaleBand()
                          .domain(d3.range(democrats.length))
                          // .rangeRoundBands([(republicans.length / 100 * len) + 20, len + 5], 0.10)

            let demYScale = d3.scaleLinear()
                          .domain([40, d3.max(republicans, function(d){ return d.votes_w_prty_pct;})])
                          .range([0, hei - padding_top])

          // create main svg
          let svg = d3.select("body")
                      .append("svg")
                      .attr("width", len + padding_length)
                      .attr("height", hei + padding_height)

          // create svgs for both sides of bar graph
          let repSenators = svg.append("g").classed("republican-senators", true);
          let demSenators = svg.append("g").classed("democratic-senators", true);


          // create scales for axes
          let demXScaleBottom = d3.scaleBand()
            .domain(democrats.map(function (d) {return d.senator_name;}))
            // .rangeRoundBands([(republicans.length / 100 * len) + 30, len - 5], 0.10)

          let repXScaleBottom = d3.scaleBand()
            .domain(republicans.map(function (d) {return d.senator_name;}))
            // .rangeRoundBands([padding_top + 5, (republicans.length / 100 * len) - 20], 0.10)

          let demYScaleRight = d3.scaleLinear()
            .domain([40, 100])
            .range([hei, padding_top])

          let repYScaleLeft = d3.scaleLinear()
            .domain([40, d3.max(republicans, function (d) { return d.votes_w_prty_pct; })])
            .range([hei, padding_top])

          // create axes
          let xAxisDem = d3.axisBottom(demXScaleBottom)
            // .scale(demXScaleBottom)
            .ticks(democrats.length)
            // .outerTickSize(0)
            // .orient("bottom");

          let yAxisDem = d3.axisRight(demYScaleRight)
            // .scale(demYScaleRight)
            // .outerTickSize(2)
            .ticks(8)
            // .orient("right");

          let yAxisRep = d3.axisLeft(repYScaleLeft)
            // .scale(repYScaleLeft)
            // .outerTickSize(2)
            .ticks(8)
            // .orient("left");

          let xAxisRep = d3.axisBottom(repXScaleBottom)
            // .scale(repXScaleBottom)
            .ticks(republicans.length)
            // .outerTickSize(0)
            // .orient("bottom");

          // append x-axis labels, senator names
          demSenators.append("g")
            .attr("class", "x-axis-dem")
            .attr("transform", "translate(0," + hei + ")")
            .call(xAxisDem)
            .selectAll("text")
            .attr("transform", "rotate(60)")
            .attr("y", 5)
            .attr("x", 8)
            .attr("dy", ".35em")
            .style("fill", "rgb(124,124,124")
            .style("text-anchor", "start");

          repSenators.append("g")
            .attr("class", "x-axis-rep")
            .attr("transform", "translate(0," + hei + ")")
            .call(xAxisRep)
            .selectAll("text")
            .attr("transform", "rotate(-60)")
            .attr("y", 5)
            .attr("x", -8)
            .attr("dy", ".35em")
            .style("fill", "rgb(124,124,124")
            .style("text-anchor", "end")

          // append y-axis labels, vote percentage ranges
          demSenators.append("g")
            .attr("class", "y-axis-dem")
            .attr("transform", "translate(" + (len - demXScale.rangeBand()) + ",0)")
            .style("fill", "rgb(124,124,124")
            .call(yAxisDem)

          repSenators.append("g")
            .attr("class", "y-axis-rep")
            .attr("transform", "translate(" + (5 + ((repXScale.rangeBand() * 2) + repXScale.rangeBand() / 2)) + ",0)")
            .style("fill", "rgb(124,124,124")
            .call(yAxisRep)

          // append the bars for republican senators
          repSenators.selectAll("rect")
                     .data(republicans)
                     .enter()
                     .append("rect")
                     .attr("x", function(d, i){return repXScale(i);})
                     .attr("y", function(d){return hei - repYScale(d.votes_w_prty_pct);})
                     .attr("width", repXScale.rangeBand())
                     .attr("height", function(d){return repYScale(d.votes_w_prty_pct);})
                     .attr("fill", function(d) {return "rgb(255, 39, 0" + "," + (0.6 - (d.key/100)) + ")";})
                     .on("mouseover", function(d){
                       let xPosition = parseFloat(d3.select(this).attr("x")) + repXScale.rangeBand() + 50;
                       let yPosition = parseFloat(d3.select(this).attr("y"));
                       repSenators.selectAll("rect")
                                  .attr("fill", function (d) {return "rgb(255, 39, 0" + "," + (0.6 - (d.key / 100))* 0.4 + ")";})
                       d3.select(this)
                         .attr("fill", function (d) {return "rgb(255, 39, 0" + "," + (0.6 - (d.key / 100)) + ")";})
                         .style("cursor", "crosshair");


                       // Update the tooltip position and value
                       d3.select("#tooltip")
                        .style("left", xPosition + "px")
                        .style("top", yPosition + "px")
                          .select("#value")
                          .html("<h4 class =" + "senator-name" + ">" + d.senator_name + " " + "(" + d.state + ")" + "</h4>" + "<hr>"
                            + "<p class = " + "voting-info" + ">" + "Percent Vote With Party: " + "<span class =" + "vote-percent" + ">" + "<strong>" + d.votes_w_prty_pct.toFixed(1) + "%" + "<strong>" + "</span>" + "</p>" + "<hr>"
                          + "<div class = wrapper>" + "<div>" + "<img src = " + d.photo_url + " onerror" + "= No photo available" + ">" + "</div>" + "<div>" + "<p class = " + "voting-info" + ">" + "Total Votes: " + "<strong>" + d.total_votes + "</strong>" + "</p>"
                              + "<p class = " + "voting-info" + ">" + "Missed Votes: " + "<strong>" + d.missed_votes + "</strong>" + "</p>" + "</div>" + "</div>"
                          )

                        // Show the tooltip
                       d3.select("#tooltip").classed("hidden", false);})
                         .on("mouseout", function() {
                              d3.select("#tooltip").classed("hidden", true);
                              repSenators.selectAll("rect")
                                         .attr("fill", function (d) {return "rgb(255, 39, 0" + "," + (0.6 - (d.key / 100)) + ")";})
                                d3.select(this)
                                  .attr("fill", function(d, i){return "rgb(255, 39, 0" + "," + (0.6 - (d.key / 100)) + ")";})
                          });

         // append the bars for democratic senators
         demSenators.selectAll("rect")
                    .data(this.democraticSenators)
                    .enter()
                    .append("rect")
                    .attr("x", function(d, i){return demXScale(i);})
                    .attr("y", function(d){return hei - demYScale(d.votes_w_prty_pct);})
                    .attr("width", demXScale.rangeBand())
                    .attr("height", function(d){return demYScale(d.votes_w_prty_pct);})
                    .attr("fill", function(d) {return "rgb(0, 143, 213, " + (d.key / 100 + 0.25) + ")"})
                    .on("mouseover", function(d){
                      let xPosition = parseFloat(d3.select(this).attr("x")) + demXScale.rangeBand() - 290;
                      let yPosition = parseFloat(d3.select(this).attr("y"));

                      demSenators.selectAll("rect")
                                 .attr("fill", function (d) {return "rgb(0, 143, 213, " + (d.key / 100 + 0.25) * 0.4 + ")";})
                      d3.select(this)
                        .attr("fill", function (d) {return "rgb(0, 143, 213, " + (d.key / 100 + 0.25) + ")"})
                        .style("cursor", "crosshair");

                      // Update the tooltip position and value
                      d3.select("#tooltip")
                       .style("left", xPosition + "px")
                       .style("top", yPosition + "px")
                       .select("#value")
                       .html("<h4 class =" + "senator-name" + ">" + d.senator_name + " " + "(" + d.state + ")" + "</h4>" + "<hr>"
                         + "<p class = " + "voting-info" + ">" + "Percent Vote With Party: " + "<span class =" + "vote-percent" + ">" + "<strong>" + d.votes_w_prty_pct.toFixed(1) + "%" + "<strong>" + "</span>" + "</p>" + "<hr>"
                          + "<div class = wrapper>" + "<div>" + "<img src = " + d.photo_url + ">" + "</div>" + "<div>" + "<p class = " + "voting-info" + ">" + "Total Votes: " + "<strong>" + d.total_votes + "</strong>" + "</p>"
                           + "<p class = " + "voting-info" + ">" + "Missed Votes: " + "<strong>" + d.missed_votes + "</strong>" + "</p>" + "</div>" + "</div>"

                        )
                      // Show the tooltip
                      d3.select("#tooltip").classed("hidden", false);
                    })
                    .on("mouseout", function() {
                       d3.select("#tooltip").classed("hidden", true);
                       demSenators.selectAll("rect")
                                  .attr("fill", function (d) {return "rgb(0, 143, 213, " + (d.key / 100 + 0.25) + ")";})
                       d3.select(this)
                         .attr("fill", function(d){return "rgb(0, 143, 213, " + (d.key / 100 + 0.25) + ")";})
                    });
              });
              // end of service pull
          }
    // end of ngOnInit
  }
// end of export class AppComponent

