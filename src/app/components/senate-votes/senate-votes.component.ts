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

  constructor(
    private propubService: PropubService,
    private spinnerService: Ng4LoadingSpinnerService
  ){}

  onResized(event: ResizedEvent): void {
    this.width = event.newWidth;
    
    if (this.width >= 1000){
      let updatedWidth = 1000;
      this.massageDataAndDrawChart(updatedWidth, 400);
    } else {
      let updatedWidth = this.width
      this.massageDataAndDrawChart(updatedWidth, 400);
    }
    
    
  }

  propubServiceCall(){
    this.propubService.getPropublicaSixteen().subscribe(
      data => {this.membersSixteen = data.results[0].members},
      err => {
        this.serverError = true;
        console.error(err);
      },
      () => {
        let sixteenCongress = this.membersSixteen;
        console.log(sixteenCongress);
      }
    )
  }
  

  massageDataAndDrawChart(len, hei){
    this.propubService.getPropublicaFifteen().subscribe(
      data => {this.members = data.results[0].members},
      err => {
        this.serverError = true;
        console.error(err);
      },
      () => {
        let senatePhotosData = this.createSenatePhotoData();
        let active_members = [];
        this.republicanSenators = [];
        this.democraticSenators = [];

        // massage data and merge two datasets
        senatePhotosData.map((photos) => {
          this.members.map((element) => {
            if (element.last_name === "Kyl") {
              element.photo_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Jon_Kyl%2C_official_109th_Congress_photo.jpg/480px-Jon_Kyl%2C_official_109th_Congress_photo.jpg";
            }
            if (element.last_name === "Hyde-Smith"){
              element.photo_url = "https://upload.wikimedia.org/wikipedia/commons/d/d7/Cindy_Hyde-Smith_official_photo.jpg";
            }
            if (element.votesmart_id === photos.votesmart_id){
              element.photo_url = photos.photo_url;
            }
          })
        })

        this.members.map(members => {
          if (members.in_office == false && (members.last_name != "Cochran" && members.last_name != "McCain" && members.last_name != "Franken" && members.last_name != "Strange" && members.last_name != "Sessions")){
            active_members.push({
              "senator_name": members.first_name + " " + members.last_name,
              "party": members.party,
              "state": members.state,
              "votes_w_prty_pct": members.votes_with_party_pct,
              "total_votes": members.total_votes,
              "missed_votes": members.missed_votes,
              "photo_url": members.photo_url
            })
          }
        })

        active_members.map(members => {
          if(members.party === "R"){
              pushPartyData(members, this.republicanSenators)
            } else if (members.party === "D"){
              pushPartyData(members, this.democraticSenators)
            } else if (members.party === "I"){
              pushPartyData(members, this.democraticSenators)
            }
        })

        sortVotes(this.republicanSenators, 1, -1);
        sortVotes(this.democraticSenators, -1, 1);

        makeKey(this.republicanSenators);
        makeKey(this.democraticSenators);

        // remove existing chart if resize needed
        d3.select("svg").remove();

        // draw chart
        drawChart(this.republicanSenators, this.democraticSenators, len, hei);
      }
    )
  }

  getSenatePhotoUrls(){
    this.senatorPhotoUrls = senatorData.default;
    return this.senatorPhotoUrls;
  }

  createSenatePhotoData(){
    let senatorPhotoUrls = this.getSenatePhotoUrls();
    senatorPhotoUrls.map((members) => {
      this.senatorPhotoData.push({
        "votesmart_id": members.votesmart,
        "name": members.name,
        "photo_url": members.photo_url
      })
    })
    return this.senatorPhotoData;
  }

    ngOnInit(){
      this.initSrnSize = window.innerWidth;
      this.initSrnHei = window.innerHeight;
      this.spinnerService.show();

      this.getSenatePhotoUrls();
      this.propubServiceCall();
      this.massageDataAndDrawChart(this.initSrnSize, this.initSrnHei);

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

      let margin = {top: 50, right: 20, bottom: 120, left: 20};

      len = len - margin.left - margin.right,
      hei = hei - margin.top - margin.bottom;
      
      // set scales for bars
      let repXScale = d3.scaleBand().rangeRound([margin.right, len - margin.right]).padding(0.1)
      repXScale.domain(d3.range(dataset1.length))

      let repYScale = d3.scaleLinear().range([0, hei])
      repYScale.domain([40, 100])

      // let demXScale = d3.scaleBand().rangeRound([(dataset1.length / 100 * len), len]).padding(0.1)
      // demXScale.domain(d3.range(dataset2.length))

      // let demYScale = d3.scaleLinear().range([0, hei])
      // demYScale.domain([40, d3.max(dataset1, function(d){ return d.votes_w_prty_pct;})])

      // create main svg
      let svg = d3.select("body")
                  .append("svg")
                  .attr("width", len + margin.left + margin.right)
                  .attr("height", hei + margin.top + margin.bottom)
                  .append("g").classed("overall-div", true)
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      // create svgs for both sides of bar graph
      let repSenators = svg.append("g")
                           .classed("republican-senators", true)
                           .attr("transform", "translate(0,0)");
                           
      // let demSenators = svg.append("g")
      //                      .classed("democratic-senators", true)
      //                      .attr("transform", "translate(0, 0)");

      //create scales for axes
      // let demXScaleBottom = d3.scaleBand().rangeRound([(dataset1.length / 100 * len), len], 0.10)
      // demXScaleBottom.domain(dataset2.map(function (d) {return d.senator_name;}))

      let repXScaleBottom = d3.scaleBand().rangeRound([margin.right, len - margin.right], 0.10)
      repXScaleBottom.domain(dataset1.map(function (d) {return d.senator_name;}))

      // let demYScaleRight = d3.scaleLinear().range([hei, 0])
      // demYScaleRight.domain([40, 100])
        
      let repYScaleLeft = d3.scaleLinear().range([hei, 0])
      repYScaleLeft.domain([40, 100])
        

      // //create axes
      // let xAxisDem = d3.axisBottom(demXScaleBottom).ticks(demXScaleBottom).tickSizeOuter(0)

      let xAxisRep = d3.axisBottom(repXScaleBottom).ticks(repXScaleBottom).tickSizeOuter(0)

      // let yAxisDem = d3.axisRight(demYScaleRight).ticks(8).tickSizeOuter(1)

      let yAxisRep = d3.axisLeft(repYScaleLeft).ticks(8).tickSizeOuter(1)
      
        // // append x-axis labels, senator members
        // demSenators.append("g")
        // .attr("class", "x-axis-dem")
        // .attr("transform", "translate(0," + 400 + ")")
        // .call(xAxisDem)
        // .selectAll("text")
        // .attr("transform", "rotate(60)")
        // .attr("y", 5)
        // .attr("x", 8)
        // .attr("dy", ".35em")
        // .style("fill", "rgb(124,124,124")
        // .style("text-anchor", "start");

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

      // // append y-axis labels, vote percentage ranges
      // demSenators.append("g")
      //   .attr("class", "y-axis-dem")
      //   .attr("transform", "translate(" + len + ",0)")
      //   .style("fill", "rgb(124,124,124")
      //   .call(yAxisDem)

      repSenators.append("g")
        .attr("class", "y-axis-rep")
        .attr("transform", "translate(" + margin.right + ",0)")
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
                    let xPosition = parseFloat(d3.select(this).attr("x")) + repXScale.bandwidth() + 30;
                    let yPosition = parseFloat(d3.select(this).attr("y")) + 85;
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

      // // append the bars for democratic senators
      // demSenators.selectAll("rect")
      //             .data(dataset2)
      //             .enter()
      //             .append("rect")
      //             .attr("x", function(d, i){return demXScale(i);})
      //             .attr("y", function(d){return hei - demYScale(d.votes_w_prty_pct);})
      //             .attr("width", demXScale.bandwidth())
      //             .attr("height", function(d){return demYScale(d.votes_w_prty_pct);})
      //             .attr("fill", function(d) {return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) + ")"})
      //             .on("mouseover", function(d){
      //               let xPosition = parseFloat(d3.select(this).attr("x")) + demXScale.bandwidth() - 325;
      //               let yPosition = parseFloat(d3.select(this).attr("y"));

      //               demSenators.selectAll("rect")
      //                         .attr("fill", function (d) {return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) * 0.4 + ")";})
      //               d3.select(this)
      //                 .attr("fill", function (d) {return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) + ")"})
      //                 .style("cursor", "crosshair");

      //               // Update the tooltip position and value
      //               d3.select("#tooltip")
      //               .style("left", xPosition + "px")
      //               .style("top", yPosition + "px")
      //               .select("#value")
      //               .html("<h4 class =" + "senator-name" + ">" + d.senator_name + " " + "(" + d.state + ")" + "</h4>" + "<hr>"
      //                 + "<p class = " + "voting-info" + ">" + "Percent Vote With Party: " + "<span class =" + "vote-percent" + ">" + "<strong>" + d.votes_w_prty_pct.toFixed(1) + "%" + "<strong>" + "</span>" + "</p>" + "<hr>"
      //                   + "<div class = wrapper>" + "<div>" + "<img src = " + d.photo_url + ">" + "</div>" + "<div>" + "<p class = " + "voting-info" + ">" + "Total Votes: " + "<strong>" + d.total_votes + "</strong>" + "</p>"
      //                   + "<p class = " + "voting-info" + ">" + "Missed Votes: " + "<strong>" + d.missed_votes + "</strong>" + "</p>" + "</div>" + "</div>"

      //                 )
      //               // Show the tooltip
      //               d3.select("#tooltip").classed("hidden", false);
      //             })
      //             .on("mouseout", function() {
      //               d3.select("#tooltip").classed("hidden", true);
      //               demSenators.selectAll("rect")
      //                           .attr("fill", function (d) {return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) + ")";})
      //               d3.select(this)
      //                 .attr("fill", function(d){return "rgba(0, 143, 213, " + (d.key / 100 + 0.25) + ")";})
      //             });

      }

      

    