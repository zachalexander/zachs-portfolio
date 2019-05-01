import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';

import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SenateVotesComponent } from './senate-votes/senate-votes.component'
import { UsMapComponent } from './us-map/us-map.component'


const routes: Routes = [
    { path: '',             component: HomeComponent },
    { path: 'user-profile',     component: ProfileComponent },
    { path: 'senate-votes',     component: SenateVotesComponent },
    { path: 'us-map',     component: UsMapComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    HttpModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
