import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-my-hosted-bookings',
  imports: [CommonModule],
  templateUrl: './my-hosted-bookings.html',
  styleUrl: './my-hosted-bookings.css',
})
export class MyHostedBookings implements OnInit {
  bookings: any[] = [];
  upcomingBookings: any[] = [];
  pastBookings: any[] = [];
  isLoading = true;
  activeTab: 'upcoming' | 'past' = 'upcoming';
  totalEarnings = 0;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.loadMyHostedBookings();
    }
  }

  loadMyHostedBookings() {
    this.isLoading = true;
    this.bookingService.getMyHostedBookings().subscribe({
      next: (res) => {
        if (res.result) {
          this.bookings = res.data || [];
          this.categorizeBookings();
        } else {
          console.error('Failed to fetch hosted bookings:', res.message);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching hosted bookings:', err);
        this.isLoading = false;
      }
    });
  }

  categorizeBookings() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort: Newest first
    const sorted = [...this.bookings].sort((a, b) => {
      return new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime();
    });

    this.upcomingBookings = sorted.filter(b => {
      const tripDate = new Date(b.pickupDate);
      tripDate.setHours(0, 0, 0, 0);
      const isActive = b.status !== 'cancelled' && !b.isCompleted;
      return isActive && tripDate.getTime() >= today.getTime();
    });

    this.pastBookings = sorted.filter(b => {
      const tripDate = new Date(b.pickupDate);
      tripDate.setHours(0, 0, 0, 0);
      return b.status === 'cancelled' || b.isCompleted || tripDate.getTime() < today.getTime();
    });

    // Calculate earnings from completed or confirmed trips (exclude pending/cancelled)
    this.totalEarnings = this.bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed' || b.status === 'active')
      .reduce((sum, b) => {
        if (b.totalPrice) return sum + b.totalPrice;
        const match = b.pricingDescription ? b.pricingDescription.match(/(\d+)/) : null;
        return sum + (match ? parseInt(match[0], 10) : 0);
      }, 0);
      
    if (this.upcomingBookings.length === 0 && this.pastBookings.length > 0) {
      this.activeTab = 'past';
    }
  }

  confirmBooking(bookingId: string) {
    this.isLoading = true;
    this.bookingService.confirmBooking(bookingId).subscribe({
      next: (res) => {
        if (res.result) {
          this.alertService.success('Booking confirmed!');
          this.loadMyHostedBookings();
        } else {
          this.alertService.error(res.message);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error confirming booking:', err);
        this.alertService.error(err.error?.message || 'Failed to confirm booking.');
        this.isLoading = false;
      }
    });
  }

  async completeBooking(bookingId: string) {
    const confirmed = await this.alertService.confirm({
      title: 'Complete Trip',
      message: 'Mark this trip as completed?'
    });
    
    if (confirmed) {
      this.isLoading = true;
      this.bookingService.completeBooking(bookingId).subscribe({
        next: (res) => {
          if (res.result) {
            this.alertService.success('Trip marked as completed.');
            this.loadMyHostedBookings();
          } else {
            this.alertService.error(res.message);
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error completing trip:', err);
          this.alertService.error(err.error?.message || 'Failed to complete trip.');
          this.isLoading = false;
        }
      });
    }
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22280%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20280%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22280%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2295%22%20y%3D%22105%22%3ECar%20Bee%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
    }
    const trimmed = String(imageUrl).trim();
    if (trimmed.startsWith('http')) return trimmed;
    
    // Fix backslashes
    const backslash = String.fromCharCode(92);
    return '/' + trimmed.split(backslash).join('/');
  }
}
