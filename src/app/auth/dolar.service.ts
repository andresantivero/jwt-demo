import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DolarService {

  constructor(private httpClient: HttpClient) { }

  llamarApiDolar(): Observable<any> {
    return this.httpClient.get('https://dolarapi.com/v1/dolares');
  }
}
