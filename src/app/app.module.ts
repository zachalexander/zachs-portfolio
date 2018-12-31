import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpModule } from '@angular/http';

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
    HttpModule
  ],
  providers: [PropubService],
  bootstrap: [AppComponent]
})
export class AppModule { }
