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
        this.drawMap(this.width, 500);
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

  console.log(stateDataset.features);
  return stateDataset.features;

}

  drawMap(width, height) {

    d3.select("svg").remove();

    let projection = d3.geoAlbersUsa();

    let path = d3.geoPath()
              .projection(projection)

    let svg = d3.select(".graphic")
                .append("svg")
                .attr("class", "map")
                .attr("x", 0)
                .attr("y", 0)
                .attr("viewBox", "0 0 1000 500")
                .attr("preserveAspectRatio", "xMidYMid meet")
                .attr("width", width)
                .attr("height", height)

    
  //   let path = d3.geoPath();
   
  //   d3.json("https://unpkg.com/us-atlas@1/us/10m.json").then(function(us){
      
  //     console.log(us);
    
  //     svg.append("path")
  //        .attr("stroke", "#aaa")
  //        .attr("stroke-width", 0.5)
  //        .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); })))

  //     svg.append("path")
  //       .attr("stroke-width", 0.5)
  //       .attr("d", path(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })))
      
  //     svg.append("path")
  //       .attr("d", path(topojson.feature(us, us.objects.nation)))

  // });
    
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

  }

 
   
}