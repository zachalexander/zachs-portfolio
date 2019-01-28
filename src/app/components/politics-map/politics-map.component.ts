import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import * as stateData from '../../../assets/us-states.json';
import * as stateFeatures from '../../../assets/us-state-features.json';
import 'rxjs/add/operator/filter';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ResizedEvent } from 'angular-resize-event/resized-event';
import { EventManagerPlugin } from '@angular/platform-browser/src/dom/events/event_manager';


@Component({
  selector: 'app-politics-map',
  templateUrl: './politics-map.component.html',
  styleUrls: ['./politics-map.component.scss']
})
export class PoliticsMapComponent implements OnInit {
  width;
  innerWidth;
  projection;
  height = 700;
  
  constructor(
    private spinnerService: Ng4LoadingSpinnerService
  ) { }


  onResized(event: ResizedEvent): void {
    this.spinnerService.show();
    this.width = event.newWidth; 

    if (this.width <= 600) {
      this.height = 400;
      this.projection = 0.85;
      this.innerWidth = window.innerWidth - 40
      setTimeout(() => {
        this.drawMap(this.width, this.height, this.projection);
        this.spinnerService.hide();
      }, 1000);
    } else {
      this.height = 600;
      this.projection = 1.50;
      this.innerWidth = window.innerWidth - 40
      setTimeout(() => {
        this.drawMap(this.width, this.height, this.projection);
        this.spinnerService.hide();
      }, 1000);
    }

  }

  ngOnInit() {

    this.spinnerService.show();

    this.innerWidth = window.innerWidth;
    console.log(this.innerWidth);

    if (this.innerWidth <= 600){
      this.height = 400;
      this.projection = 0.85;
      this.innerWidth = window.innerWidth - 40
      this.addValues();
      console.log(this.height);
      setTimeout(() => {
        this.drawMap(this.innerWidth, this.height, this.projection);
        this.spinnerService.hide();
      }, 2000);
    } else {
      this.innerWidth = window.innerWidth - 40
      this.height = 600;
      this.projection = 1.50;
      this.addValues();
      setTimeout(() => {
        console.log(this.height);
        this.drawMap(this.innerWidth, this.height, this.projection);
        this.spinnerService.hide();
      }, 2000);
    } 

  }

addValues() {

  let stateDataset = stateData.default;
      
  d3.csv("../../../assets/firearm-deaths-2017.csv", function(data) {
    let dataState = data.state;
    let dataRate = parseFloat(data.rate);
    let dataDeaths = data.deaths;

    for (let i = 0; i < stateDataset.features.length; i++){
      let jsonState = stateDataset.features[i].properties.name;

      if (dataState === jsonState){
        stateDataset.features[i].properties["value"] = dataRate;
        stateDataset.features[i].properties.deaths = dataDeaths;
      }
    }
  })

  stateDataset.features.map(data => {
    stateFeatures.default.map(features => {
      if (data.properties.name === features.state) {
        data.properties.map_image_url = features.map_image_url;
        data.properties.flag_image_url = features.state_flag_url;
      }
    })
  });

  return stateDataset.features;

}

  drawMap(len, hei, proj) {

    d3.select("svg").remove();

    let margin = {top: 0, right: 10, bottom: 0, left: 10}

    let projection = d3.geoAlbersUsa()
                      .scale(len/proj, hei/proj)
                      .translate([len/2, hei/2]);
       
    let color = d3.scaleQuantize()
                  .range(['#f1eef6','#d0d1e6','#a6bddb','#74a9cf','#2b8cbe','#045a8d'])
                  .domain([2.5, 24.5])

    let path = d3.geoPath()
                .projection(projection)

    let svg = d3.select('.chart-canvas')
                .append('svg')
                .classed("svg-container", true)
                .attr("width", len - margin.right - margin.left)
                .attr("height", hei)

    svg.selectAll("path")
    .data(this.addValues())
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", function(d){
      var value = d.properties.value;
        if(value) {
          return color(d.properties.value);
        } else {
          return "#333";
        }
    })
    .style('stroke', '#333')
    .style('stroke-width', '1')                 
    .classed("svg-content-responsive", true) 
    .on("mouseover", function(d){
      let xPosition = d3.mouse(this)[0] + 50;
      let yPosition = d3.mouse(this)[1] - 50;
     
      d3.select(this)
        .style("cursor", "crosshair")
        .style("stroke", "#333")
        .style("stroke-width", "3");
      
        // Update the tooltip position and value
        d3.select("#tooltip-map")
        .style("position", "absolute")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .select("#value-map")
        .html("<h4 class =" + "senator-name" + ">" + d.properties.name + "</h4>" + "<hr>"
          + "<div class = wrapper>" + "<div>" + "<img src = " + d.properties.flag_image_url + " onerror" + "= No photo available" + "class = " + "flag" + ">" + "</div>" + "<div>" + "<p class = " + "voting-info" + ">" + "Mortality Rate: " + "<strong>" + d.properties.value + "%" + "</strong>" + "</p>"
          + "<p class = " + "voting-info" + ">" + "Total Deaths in 2017: " + "<strong>" + d.properties.deaths + "</strong>" + "</p>" + "</div>" + "</div>"
        )

        svg.select("path")
          .attr("d", path)
          .style("fill", function (d) {
            var value = d.properties.value;
            if (value) {
              return color(d.properties.value);
            } else {
              return "#333";
            }
          })
        


        // Show the tooltip
        d3.select("#tooltip-map").classed("hidden", false);
      })
      .on("mouseout", function() {
          d3.select("#tooltip-map").classed("hidden", true);
          d3.select(this)
            .style("stroke-width", "1")
            .style("stroke", "#333")
      });

      // svg.append("g")
      //   .append("text")
      //   .text("*Mortality rate = firearm deaths per 100,000 individuals")
      //   .attr("x", function() {

      //     let stringWidth = d3.select(this)._groups["0"]["0"].clientWidth;
      //     return ((len / 2) - (stringWidth / 2));
      //   })
      //   .attr("y", hei - 5)
      //   .attr("id", "captionText")

  }

 
   
}