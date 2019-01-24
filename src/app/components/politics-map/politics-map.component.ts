import { Component, OnInit } from '@angular/core';
import * as d3 from "d3";
import * as stateData from '../../../assets/us-states.json';
import 'rxjs/add/operator/filter';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';



@Component({
  selector: 'app-politics-map',
  templateUrl: './politics-map.component.html',
  styleUrls: ['./politics-map.component.scss']
})
export class PoliticsMapComponent implements OnInit {
  
  constructor(
    private spinnerService: Ng4LoadingSpinnerService
  ) { }

  ngOnInit() {

    this.spinnerService.show();
    let canvasWid = window.innerWidth;
    this.addValues();

    setTimeout(() => {
      this.drawMap(1400, 600);
      this.spinnerService.hide();
    }, 1000);

    

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

  return stateDataset.features;

}

  drawMap(len, hei) {

    let projection = d3.geoAlbersUsa()
                      .translate([len/2, hei/2]);
    
    let color = d3.scaleQuantize()
                  .range(['#f1eef6','#d0d1e6','#a6bddb','#74a9cf','#2b8cbe','#045a8d'])
                  .domain([2.5, 24.5])

    let path = d3.geoPath()
                .projection(projection)

    let svg = d3.select('.chart-canvas')
                .append("div")
                .classed("svg-container", true) //container class to make it responsive
                .append('svg')
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 1400 600")
                .attr("transform", "translate(10, 0)")     

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
    .attr("width", len)
    .attr("height", hei)
    .attr("transform", "translate(20, 0)")
    .classed("svg-content-responsive", true) 
    .on("mouseover", function(d){
      let xPosition = d3.mouse(this)[0] + 100;
      let yPosition = d3.mouse(this)[1] - 100;
     
      d3.select(this)
        .style("cursor", "crosshair")
        .style("stroke", "#333")
        .style("stroke-width", "3");
      
        // Update the tooltip position and value
        d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
          .select("#value")
          .html("<h4 class =" + "senator-name" + ">" + d.properties.name + "</h4>" + "<hr>"
          + "<p class = " + "senator-name" + ">" + "<strong>" + "Total Firearm Deaths: " + d.properties.deaths + "</strong>" + "</p>"
          + "<p class = " + "senator-name" + ">" + "<strong>" + "Mortality Rate: " + d.properties.value + "%" + "</strong>" + "</p>"
          )

        // Show the tooltip
        d3.select("#tooltip").classed("hidden", false);
      })
      .on("mouseout", function() {
          d3.select("#tooltip").classed("hidden", true);
          d3.select(this)
            .style("stroke-width", "1")
            .style("stroke", "#333")
      });

      svg.append("g")
        .append("text")
        .text("*Mortality rate = firearm deaths per 100,000 individuals")
        .attr("x", function() {

          let stringWidth = d3.select(this)._groups["0"]["0"].clientWidth;
          console.log(stringWidth);
          return ((len / 2) - (stringWidth / 2));
        })
        .attr("y", hei - 10)
        .attr("id", "captionText")

      svg.append("g")
      .append("text")
      .text("Firearm Mortality by State in 2017")
      .attr("x", function() {

        let stringWidth = d3.select(this)._groups["0"]["0"].clientWidth;
        console.log(stringWidth);
        return ((len / 2) - (stringWidth / 2));
      })
      .attr("y", hei - (hei - 60))
      .attr("id", "mapTitle")

  }

 
   
}