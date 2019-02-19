import { Component, ViewEncapsulation } from '@angular/core';
import { BirdsService } from '../../services/birds.service';
import 'rxjs/add/operator/filter';

@Component({
  selector: 'app-birdviz',
  templateUrl: './birdviz.component.html',
  styleUrls: ['./birdviz.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BirdvizComponent {
  birds;
  serverError;

  constructor(
    private birdsService: BirdsService,
  ) { }

  getBirds() {
    this.birdsService.getBirdObs().subscribe(
      data => {this.birds = data; },
      err => {
        this.serverError = true;
        console.error(err);
      },
      () => {
        console.log(this.birds);
        }
      );
  }



  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit() {
    this.getBirds();
  }

}


