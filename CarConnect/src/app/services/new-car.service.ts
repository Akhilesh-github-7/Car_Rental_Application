import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewCarService {

  private apiUrl = environment.apiUrl + '/new-cars';

  constructor(private http: HttpClient) { }

  createCar(carData: FormData | any): Observable<any> {
    return this.http.post<any>(this.apiUrl, carData);
  }
}
