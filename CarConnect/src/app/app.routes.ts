import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Search } from './pages/search/search';
import { Booking } from './pages/booking/booking';
import { MyBooking } from './pages/my-booking/my-booking';
import { MyHostedBookings } from './pages/my-hosted-bookings/my-hosted-bookings';
import { CarDetails } from './pages/car-details/car-details';
import { HostYourCar } from './pages/host-your-car/host-your-car';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'search',
    component: Search,
  },
  {
    path: 'booking',
    component: Booking,
  },
  {
    path: 'my-booking',
    component: MyBooking,
  },
  {
    path: 'my-hosted-bookings',
    component: MyHostedBookings,
  },
  {
    path: 'car/:id',
    component: CarDetails,
  },
  {
    path: 'host-your-car',
    component: HostYourCar,
  }
];
