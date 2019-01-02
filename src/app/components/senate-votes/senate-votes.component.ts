import { Component, ViewEncapsulation } from '@angular/core';
import * as d3 from "d3";
import { PropubService } from '../../services/propub.service';
import * as senatorData from '../../../assets/us-senate.json';
import 'rxjs/add/operator/filter';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ResizedEvent } from 'angular-resize-event/resized-event';


@Component({
  selector: 'app-root',
  templateUrl: './senate-votes.component.html',
  styleUrls: ['./senate-votes.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class SenateVotesComponent {
  width: number;
  height: number;
  members;
  members_data = [];
  senators_data = [];
  republicanSenators = [];
  democraticSenators = [];
  independentSenators = [];
  senatorSup = [];
  dataset: Object;
  serverError = false;
  republicans = [];
  democrats = [];

  constructor(
    private propubService: PropubService,
    private spinnerService: Ng4LoadingSpinnerService
  ){}

  onResized(event: ResizedEvent): void {
    this.width = event.newWidth;

    console.log(this.width);
    // this.getPropublica(this.width, 400);    
  }

    // grab data from service
    getPropublica(len, hei){
      this.propubService.getPropublica().subscribe(
        data => {
          this.members = data.results[0].members;
          let senatorPhotos = senatorData.default;
          senatorPhotos.map((names) => {
            this.senatorSup.push({
              "votesmart_id": names.votesmart,
              "name": names.name,
              "photo_url": names.photo_url,
            })
          })
  
          // console.log("propublica:", this.members);
          // console.log("senatorJson:", senatorPhotos);
          
          this.senatorSup.map((supelement) => {
            this.members.map((element) => {
              if (element.votesmart_id === supelement.votesmart_id){
                element.photo_url = supelement.photo_url;
              }
            })
          })
        },
        err => {
          this.serverError = true;
          console.error(err)
          this.spinnerService.hide();
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
          
          photoReplace(this.republicanSenators);
          photoReplace(this.democraticSenators);
  
          // add key property to datasets for bar coloring purposes
          makeKey(this.republicanSenators);
          makeKey(this.democraticSenators);
          
          d3.select("svg").remove();
          drawChart(this.republicanSenators, this.democraticSenators, len, hei);
          });
        // end of service pull
    }

    ngOnInit(){
      this.spinnerService.show();
  
      // svg dimensions
      let len = 1200;
      let hei = 400;

      this.getPropublica(1200, 400);
      this.spinnerService.hide();
    }
      // end of ngOnInit
  }
// end of export class AppComponent


// =========== DATA MANIPULATION FUNCTIONS =========== //

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

    // fix missing photos in dataset
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

    function drawChart(dataset1, dataset2, len, hei){

      let padding_length = 20;
      let padding_height = 140;
      let padding_top = 20;
    
      // set scales for bars
      let repXScale = d3.scaleBand().rangeRound([5, dataset1.length / 100 * len]).padding(0.1)
      repXScale.domain(d3.range(dataset1.length))

      let repYScale = d3.scaleLinear().range([0, hei - padding_top])
      repYScale.domain([40, d3.max(dataset1, function (d) { return d.votes_w_prty_pct; })])

      let demXScale = d3.scaleBand().rangeRound([(dataset1.length / 100 * len) + 20, len + 5]).padding(0.1)
      demXScale.domain(d3.range(dataset2.length))

      let demYScale = d3.scaleLinear().range([0, hei - padding_top])
      demYScale.domain([40, d3.max(dataset1, function(d){ return d.votes_w_prty_pct;})])
                      

      // create main svg
      let svg = d3.select("body")
                  .append("svg")
                  .attr("width", len + padding_length)
                  .attr("height", hei + padding_height)

      // create svgs for both sides of bar graph
      let repSenators = svg.append("g").classed("republican-senators", true);
      let demSenators = svg.append("g").classed("democratic-senators", true);


      // create scales for axes
      let demXScaleBottom = d3.scaleBand().rangeRound([(dataset1.length / 100 * len) + 30, len - 5], 0.10)
      demXScaleBottom.domain(dataset2.map(function (d) {return d.senator_name;}))

      let repXScaleBottom = d3.scaleBand().rangeRound([padding_top + 5, (dataset1.length / 100 * len) - 20], 0.10)
      repXScaleBottom.domain(dataset1.map(function (d) {return d.senator_name;}))

      let demYScaleRight = d3.scaleLinear().range([hei, padding_top])
      demYScaleRight.domain([40, 100])
        
      let repYScaleLeft = d3.scaleLinear().range([hei, padding_top])
      repYScaleLeft.domain([40, 100])
        

      // create axes
      let xAxisDem = d3.axisBottom(demXScaleBottom).ticks(dataset2.length).tickSizeOuter(0)

      let yAxisDem = d3.axisRight(demYScaleRight).ticks(8).tickSizeOuter(2)

      let yAxisRep = d3.axisLeft(repYScaleLeft).ticks(8).tickSizeOuter(2)

      let xAxisRep = d3.axisBottom(repXScaleBottom).ticks(dataset1.length).tickSizeOuter(0)
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
        .attr("transform", "translate(" + (len - demXScale.bandwidth()) + ",0)")
        .style("fill", "rgb(124,124,124")
        .call(yAxisDem)

      repSenators.append("g")
        .attr("class", "y-axis-rep")
        .attr("transform", "translate(" + (((repXScale.bandwidth() * 2) + repXScale.bandwidth() / 2)) + ",0)")
        .style("fill", "rgb(124,124,124")
        .call(yAxisRep)

      // append the bars for republican senators
      repSenators.selectAll("rect")
                  .data(dataset1)
                  .enter()
                  .append("rect")
                  .attr("x", function(d, i){return repXScale(i);})
                  .attr("y", function(d){return hei - repYScale(d.votes_w_prty_pct);})
                  .attr("width", repXScale.bandwidth())
                  .attr("height", function(d){return repYScale(d.votes_w_prty_pct);})
                  .attr("fill", function(d) {return "rgba(255, 39, 0" + "," + (0.6 - (d.key/100)) + ")";})
                  .on("mouseover", function(d){
                    let xPosition = parseFloat(d3.select(this).attr("x")) + repXScale.bandwidth() + 50;
                    let yPosition = parseFloat(d3.select(this).attr("y"));
                    repSenators.selectAll("rect")
                              .attr("fill", function (d) {return "rgba(255, 39, 0" + "," + (0.6 - (d.key / 100))* 0.4 + ")";})
                    d3.select(this)
                      .attr("fill", function (d) {return "rgba(255, 39, 0" + "," + (0.6 - (d.key / 100)) + ")";})
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
                                      .attr("fill", function (d) {return "rgba(255, 39, 0" + "," + (0.6 - (d.key / 100)) + ")";})
                            d3.select(this)
                              .attr("fill", function(d, i){return "rgba(255, 39, 0" + "," + (0.6 - (d.key / 100)) + ")";})
                      });

      // append the bars for democratic senators
      demSenators.selectAll("rect")
                  .data(dataset2)
                  .enter()
                  .append("rect")
                  .attr("x", function(d, i){return demXScale(i);})
                  .attr("y", function(d){return hei - demYScale(d.votes_w_prty_pct);})
                  .attr("width", demXScale.bandwidth())
                  .attr("height", function(d){return demYScale(d.votes_w_prty_pct);})
                  .attr("fill", function(d) {return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) + ")"})
                  .on("mouseover", function(d){
                    let xPosition = parseFloat(d3.select(this).attr("x")) + demXScale.bandwidth() - 290;
                    let yPosition = parseFloat(d3.select(this).attr("y"));

                    demSenators.selectAll("rect")
                              .attr("fill", function (d) {return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) * 0.4 + ")";})
                    d3.select(this)
                      .attr("fill", function (d) {return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) + ")"})
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
                                .attr("fill", function (d) {return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) + ")";})
                    d3.select(this)
                      .attr("fill", function(d){return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) + ")";})
                  });

      }

      

    