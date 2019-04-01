import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { AngularResizedEventModule } from 'angular-resize-event';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { HomeComponent } from './components/home/home.component';
import { SenateVotesComponent } from './components/senate-votes/senate-votes.component';

import { PropubService } from './services/propub.service';
import { BirdsService } from './services/birds.service';
import { PoliticsMapComponent } from './components/politics-map/politics-map.component';
import { NyStateElevationMapComponent } from './components/ny-state-elevation-map/ny-state-elevation-map.component';
import { ParksVisualComponent } from './components/parks-visual/parks-visual.component';


@NgModule({
  declarations: [
    AppComponent,
    SenateVotesComponent,
    HomeComponent,
    PoliticsMapComponent,
    NyStateElevationMapComponent,
    ParksVisualComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    Ng4LoadingSpinnerModule.forRoot(),
    AngularResizedEventModule,
    BrowserAnimationsModule
   ],
  providers: [PropubService, BirdsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
