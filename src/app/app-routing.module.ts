import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SenateVotesComponent } from './components/senate-votes/senate-votes.component';
import { PoliticsMapComponent } from './components/politics-map/politics-map.component';
import { ParksVisualComponent } from './components/parks-visual/parks-visual.component';
import { HomeLayoutComponent } from './components/home-layout/home-layout.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'senate-votes', component: SenateVotesComponent },
  { path: 'politics-map', component: PoliticsMapComponent },
  { path: 'parks-visual', component: ParksVisualComponent},
  { path: 'layout', component: HomeLayoutComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

