import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import * as stateData from '../../../assets/us-states.json';
import * as stateFeatures from '../../../assets/us-state-features.json';
import 'rxjs/add/operator/filter';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ResizedEvent } from 'angular-resize-event/resized-event';
// import { EventManagerPlugin } from '@angular/platform-browser/src/dom/events/event_manager';
import * as topojson from "topojson-client";

@Component({
  selector: 'app-politics-map',
  templateUrl: './politics-map.component.html',
  styleUrls: ['./politics-map.component.scss']
})
export class PoliticsMapComponent implements OnInit {
  innerWidth;
  width;
  
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
  }



  ngOnInit() {

    this.spinnerService.show();

    this.innerWidth = window.innerWidth;
    setTimeout(() => {
      this.drawMap(this.innerWidth, 500)
      this.spinnerService.hide();
    }, 2000);
    

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

  drawMap(width, height) {

    d3.select("svg").remove();

    let projection = d3.geoAlbersUsa();

    let path = d3.geoPath()
              .projection(projection)
    
    let ext_color_domain = [2.5, 5.5, 11.5, 20.5, 24.5];

    let color_domain = [2.5, 5.5, 11.5, 20.5, 24.5]

    let legend_labels = ["2.5% - 5.1%", "5.2% - 13.5%", "13.6% - 16.9%", "17.0% - 20.9%", ">21.0%"];

    let color_legend = d3.scaleThreshold()
      .range(['#f1eef6', '#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe', '#045a8d'])
      .domain(color_domain)


    let svg = d3.select(".graphic")
                .append("svg")
                .attr("class", "map")
                .attr("x", 0)
                .attr("y", 0)
                .attr("viewBox", "-30 -20 1000 550")
                .attr("preserveAspectRatio", "xMidYMid")
                .attr("width", width)
                .attr("height", height)

    let legend = svg.selectAll("g")
      .data(ext_color_domain)
      .classed("legend", true)
      .enter().append("g")
      .attr("class", "legend");

    var ls_w = 20, ls_h = 20;

    legend.append("rect")
      .attr("x", 820)
      .attr("y", function (d, i) { return (height - (i * ls_h) - 2 * ls_h) - 40; })
      .attr("width", ls_w)
      .attr("height", ls_h)
      .style("stroke", "#333")
      .style("stroke-width", "1")
      .style("fill", function (d, i) { return color_legend(d); })
      .style("opacity", 0.8);

    legend.append("text")
      .attr("x", 850)
      .attr("y", function (d, i) { return (height - (i * ls_h) - ls_h - 4) - 40; })
      .text(function (d, i) { return legend_labels[i]; });


    legend.append("text")
      .attr("x", 835)
      .attr("y", (height - (5.5 * ls_h) - ls_h - 4) - 40)
      .text("Mortality Rate");
    
    let color = d3.scaleQuantize()
                .range(['#f1eef6','#d0d1e6','#a6bddb','#74a9cf','#2b8cbe','#045a8d'])
                .domain([2.5, 24.5])                    

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
          .style("left", function(){
              if (xPosition < 500){
                return xPosition + 250 + "px";
              } else {
                return xPosition - 250 + "px";
              }
          })
          .style("top", function(){
            if (yPosition < 250) {
              return yPosition + 100 + "px";
            } else {
              return yPosition - 100 + "px";
            }
          })
          .select("#value-map")
          .html("<h4 class =" + "senator-name" + ">" + d.properties.name + "</h4>" + "<hr>"
            + "<div class = wrapper>" + "<div>" + "<img src = " + d.properties.flag_image_url + " onerror" + "= No photo available" + "class = " + "flag" + ">" + "</div>" + "<div>" + "<p class = " + "voting-info" + ">" + "Mortality Rate: " + "<strong>" + d.properties.value + "%" + "</strong>" + "</p>"
            + "<p class = " + "voting-info" + ">" + "Total Deaths in 2017: " + "<strong>" + d.properties.deaths + "</strong>" + "</p>" + "</div>" + "</div>"
          )
          
          // Show the tooltip
          d3.select("#tooltip-map").classed("hidden", false);
        })
        .on("mouseout", function() {
            d3.select("#tooltip-map").classed("hidden", true);
            d3.select(this)
              .style("stroke-width", "1")
              .style("stroke", "#333")
        });

  }

 
   
}