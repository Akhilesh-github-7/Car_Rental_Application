import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { CarService } from '../../services/car.service';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { ScrollService } from '../../services/scroll.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-my-booking',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-booking.html',
  styleUrl: './my-booking.css',
})
export class MyBooking implements OnInit {
  private scrollService = inject(ScrollService);
  bookings: any[] = [];
  upcomingBookings: any[] = [];
  pastBookings: any[] = [];
  
  isLoading = true;
  activeTab: 'upcoming' | 'past' = 'upcoming';

  constructor(
    private bookingService: BookingService,
    private carService: CarService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadMyBookings();
  }

  setActiveTab(tab: 'upcoming' | 'past') {
    this.activeTab = tab;
    // Ensure the scroll happens after DOM is updated
    setTimeout(() => {
      this.scrollService.scrollToTop('smooth');
      this.scrollService.scrollToElement('my-bookings-top', 'smooth');
    }, 50);
  }

  loadMyBookings() {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        if (res.result) {
          this.bookings = res.data;
          this.enrichBookings();
          this.categorizeBookings();
        } else {
          console.error('Failed to fetch bookings:', res.message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.isLoading = false;
      }
    });
  }

  enrichBookings() {
    this.bookings.forEach(booking => {
      const isGeneric = !booking.carOwnerName || booking.carOwnerName === 'Car Owner' || booking.carOwnerName === 'Car Host';
      if (isGeneric && booking.carId) {
        this.carService.getCarById(booking.carId).subscribe({
          next: (res) => {
            if (res.result && res.data && res.data.ownerName) {
              booking.carOwnerName = res.data.ownerName;
              // Re-run categorization to trigger change detection implicitly if needed, mostly reference update is enough for Angular
            }
          },
          error: (err) => console.error(`Failed to fetch owner for car ${booking.carId}`, err)
        });
      }
    });
  }

  categorizeBookings() {
    // Get start of today (00:00:00) to compare dates without time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort by pickup date (newest first for both initially)
    const sorted = [...this.bookings].sort((a, b) => {
      return new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime();
    });

    this.upcomingBookings = sorted.filter(b => {
      const tripDate = new Date(b.pickupDate);
      tripDate.setHours(0, 0, 0, 0);
      
      // Active if not marked completed, NOT cancelled, AND pickup date is today or future
      const isActive = b.status !== 'cancelled' && !b.isCompleted;
      return isActive && tripDate.getTime() >= today.getTime();
    });

    this.pastBookings = sorted.filter(b => {
      const tripDate = new Date(b.pickupDate);
      tripDate.setHours(0, 0, 0, 0);
      
      // Past if completed, cancelled, OR pickup date is strictly before today
      return b.status === 'cancelled' || b.isCompleted || tripDate.getTime() < today.getTime();
    });
    
    // If no upcoming bookings but have past ones, switch tab
    if (this.upcomingBookings.length === 0 && this.pastBookings.length > 0) {
      this.setActiveTab('past');
    }
  }

  async cancelBooking(bookingId: string) {
    const confirmed = await this.alertService.confirm({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking?'
    });

    if (confirmed) {
      this.isLoading = true;
      this.bookingService.cancelBooking(bookingId).subscribe({
        next: (res) => {
          if (res.result) {
            this.alertService.success('Booking cancelled successfully.');
            this.loadMyBookings(); // Reload to update lists
          } else {
            this.alertService.error(res.message || 'Failed to cancel booking.');
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error cancelling booking:', err);
          this.alertService.error(err.error?.message || 'Error cancelling booking.');
          this.isLoading = false;
        }
      });
    }
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22280%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20280%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22280%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2295%22%20y%3D%22105%22%3ECar%20Bee%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
    }
    
    let trimmedUrl = String(imageUrl).trim();
    if (trimmedUrl.startsWith('http')) return trimmedUrl;
    
    const backslash = String.fromCharCode(92);
    trimmedUrl = trimmedUrl.split(backslash).join('/');
    
    if (trimmedUrl.startsWith('/')) return environment.baseUrl + trimmedUrl;
    return environment.baseUrl + '/' + trimmedUrl;
  }
}
