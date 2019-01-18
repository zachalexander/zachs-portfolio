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
    // factoring in margin set in css
    let canvasWid = window.innerWidth;
    let canvasHei = window.innerHeight;

    this.addValues();

    setTimeout(() => {
      this.drawMap(canvasWid, 600);
    }, 100);
   
   this.spinnerService.hide();


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
                .append('svg')
                .attr("width", len - 20)
                .attr("height", hei)
                .attr("transform", "translate(10, -70)")     

                svg.selectAll("path")
                .data(this.addValues())
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function(d){
                  var value = d.properties.value;
                  console.log(d);
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
                .on("mouseover", function(d){
                  d3.select(this)
                    .style("cursor", "crosshair")
                    .style("stroke", "#333")
                    .style("stroke-width", "3");
                  
                    // Update the tooltip position and value
                    d3.select("#tooltip")
                    .style("left", 20 + "px")
                    .style("top", 0 + "px")
                    .select("#value")
                    .html("<h4 class =" + "senator-name" + ">" + d.properties.name + " " + "(" + d.properties.value + "%)" + "</h4>")

                    // Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
                  })
                  .on("mouseout", function() {
                      d3.select("#tooltip").classed("hidden", true);
                      d3.select(this)
                        .style("stroke-width", "1")
                        .style("stroke", "#333")
                  });
        

  }

 
   
}