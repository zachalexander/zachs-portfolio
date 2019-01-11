import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { SenatorData } from '../shared/interfaces/senatordata';
import { CongressData } from '../shared/interfaces/congressdata';

@Injectable({
  providedIn: 'root'
})
export class PropubService {
apiRoot: string = "https://api.propublica.org/congress";
computerRoot: string = "C:/Users/zalexander/Desktop"

  constructor(private http:Http) { }

  getPropublicaFifteen() {
      let url = `${this.apiRoot}/v1/115/senate/members.json`;
      let headers = new Headers();
      headers.set('X-API-Key', '5buFoSrpgu70owCTEcp7Z3mjThGka24f5SW8EyJA');
      return this.http.get(url, { headers: headers })
          .map(res => res.json());
  }

  // getPropublicaFifteenTest(): Observable<SenatorData> {
  //     let url = `${this.apiRoot}/v1/115/senate/members.json`;
  //     let headers = new Headers();
  //     headers.set('X-API-Key', '5buFoSrpgu70owCTEcp7Z3mjThGka24f5SW8EyJA');
  //     return this.http.get(url, { headers: headers })
  //         .pipe(
  //           map(data => this.transformCongressData(data)),
  //           tap(data => console.log(JSON.stringify(data))),
  //           catchError(this.throwError)
  //         );
  // }

  // private transformCongressData(data: CongressData): SenatorData {
    
  //   console.log(data);
    
  //   return {
  //     senator_name: data.first_name + " " + data.last_name,
  //     party: data.party,
  //     state: data.state,
  //     votes_w_prty_pct: data.votes_with_party_pct,
  //     total_votes: data.total_votes,
  //     missed_votes: data.missed_votes,
  //     photo_url: data.photo_url
  //   }
  // }
  
  getPropublicaSixteen() {
    let url = `${this.apiRoot}/v1/116/house/members.json`;
    let headers = new Headers();
    headers.set('X-API-Key', '5buFoSrpgu70owCTEcp7Z3mjThGka24f5SW8EyJA');
    return this.http.get(url, { headers: headers })
        .map(res => res.json());
  }

}
