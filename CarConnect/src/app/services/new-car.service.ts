import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewCarService {

  private apiUrl = '/api/new-cars';

  constructor(private http: HttpClient) { }

  createCar(carData: FormData | any): Observable<any> {
    return this.http.post<any>(this.apiUrl, carData);
  }
}
