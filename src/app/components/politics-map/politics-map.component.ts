import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as stateData from '../../../assets/us-states.json';
import * as stateFeatures from '../../../assets/us-state-features.json';
import 'rxjs/add/operator/filter';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ResizedEvent } from 'angular-resize-event/resized-event';
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';

@Component({
  selector: 'app-politics-map',
  templateUrl: './politics-map.component.html',
  styleUrls: ['./politics-map.component.scss']
})

export class PoliticsMapComponent implements OnInit {

  constructor(
    private spinnerService: Ng4LoadingSpinnerService
  ) { }

  shiftDown() {
    console.log('this works.');
  }

  ngOnInit() {

    mapboxgl.accessToken = 'pk.eyJ1IjoiemRhbGV4YW5kZXIiLCJhIjoiY2pzMmFjbXEwMW5iOTQzbzk3dWZuZWF1ayJ9.T2e88YGsDsa03TXrNmtf7Q';
    const map = new mapboxgl.Map({
    container: 'map-container',
    style: 'mapbox://styles/zdalexander/cjsoxby1b7d1a1fmrbl2eppsx',
    center: [-73.9384, 41.4021],
    zoom: 14,
    attributionControl: false,
    });

    map.scrollZoom.disable();
    map.dragPan.disable();

  }

}


