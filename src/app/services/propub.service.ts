import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Members} from '../shared/interfaces/propublica';
import { CongressData } from '../shared/interfaces/congressdata';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

const members: Members = {} as any;

@Injectable({
  providedIn: 'root'
})
export class PropubService {
  constructor(private http: HttpClient) { }
  private URL = 'https://api.propublica.org/congress';

  searchPropubData(): Observable<Members> {
    const url = `${this.URL}/v1/115/senate/members.json`;
    httpOptions.headers = httpOptions.headers.set('X-API-Key', '5buFoSrpgu70owCTEcp7Z3mjThGka24f5SW8EyJA');

    return this.http.get<Members>(url, httpOptions)
          .pipe(tap(resp => resp)
    );
  }

  searchSenatorPhotos(): Observable<CongressData> {
    return this.http.get<CongressData>('../../assets/us-senate.json')
            .pipe(tap(resp => resp)
    );
  }

}
