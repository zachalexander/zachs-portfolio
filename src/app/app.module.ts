import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpModule } from '@angular/http';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { AngularResizedEventModule } from 'angular-resize-event';

import { HomeComponent } from './components/home/home.component';
import { SenateVotesComponent } from './components/senate-votes/senate-votes.component';

import { PropubService } from './services/propub.service';


@NgModule({
  declarations: [
    AppComponent,
    SenateVotesComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    Ng4LoadingSpinnerModule.forRoot(),
    AngularResizedEventModule
  ],
  providers: [PropubService],
  bootstrap: [AppComponent]
})
export class AppModule { }
