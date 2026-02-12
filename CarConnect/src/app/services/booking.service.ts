import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private apiUrl = '/api/bookings';

  constructor(private http: HttpClient) { }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, bookingData);
  }

  getMyBookings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-bookings`);
  }

  getMyHostedBookings(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-hosted-bookings`);
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/cancel`, {});
  }

  completeBooking(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/complete`, {});
  }

  confirmBooking(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/confirm`, {});
  }
}
