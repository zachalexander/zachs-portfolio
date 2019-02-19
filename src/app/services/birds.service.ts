import { Injectable } from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable({
  providedIn: 'root'
})
export class BirdsService {

  apiRoot = 'https://ebird.org/ws2.0/data';

  constructor(private http: Http) { }

  getBirdObs() {
    const url = `${this.apiRoot}/obs/L295658/recent.json`;
    const headers = new Headers();
    headers.set('X-eBirdApiToken', '95csecb9qk75');
    return this.http.get(url, { headers: headers })
        .map(res => res.json());
  }
}
