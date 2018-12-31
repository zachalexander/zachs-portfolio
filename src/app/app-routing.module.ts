import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SenateVotesComponent } from './components/senate-votes/senate-votes.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'senate-votes', component: SenateVotesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

