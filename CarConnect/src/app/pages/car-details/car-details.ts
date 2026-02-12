import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-car-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './car-details.html',
  styleUrls: ['./car-details.css']
})
export class CarDetails implements OnInit {
  car: any;
  isLoading = true;
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService,
    private authService: AuthService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const carId = params['id'];
      if (carId) {
        this.isLoading = true;
        this.carService.getCarById(carId).subscribe({
          next: (res) => {
            if (res.result && res.data) {
              this.car = res.data;
              this.isOwner = res.data.isOwner || false; // Backend returns this flag
            }
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error fetching car details:', err);
            this.isLoading = false;
          }
        });
      }
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return this.getPlaceholderImage();
    }
    
    let trimmedUrl = String(imageUrl).trim();
    
    if (trimmedUrl.startsWith('http')) {
      return trimmedUrl;
    }
    
    // Replace backslashes
    const backslash = String.fromCharCode(92);
    trimmedUrl = trimmedUrl.split(backslash).join('/');
    
    if (trimmedUrl.startsWith('/')) {
      return environment.baseUrl + trimmedUrl;
    }
    
    return environment.baseUrl + '/' + trimmedUrl;
  }

  getPlaceholderImage(): string {
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22280%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20280%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22280%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2295%22%20y%3D%22105%22%3ECar%20Bee%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  }

  bookCar() {
    if (!this.authService.isLoggedIn()) {
      this.modalService.openLoginModal('Login to book this car');
      return;
    }

    if (this.isOwner) {
      this.alertService.warning('You cannot book your own car.');
      return;
    }

    // Navigate to booking page with car ID
    // Assuming /booking accepts query params or is structure /booking/:carId
    // Based on previous search.ts, it was using queryParams: { carId }
    this.router.navigate(['/booking'], { queryParams: { carId: this.car._id } });
  }

  editCar() {
    // Navigate to an edit page or open modal
    // For now, we'll assume we might repurpose HostYourCar or have a dedicated route
    // But since no dedicated Edit route exists in my file list, I'll log it
    // Or I can navigate to host-your-car with query params to trigger edit mode if I implemented it there (I haven't yet)
    console.log('Edit car clicked');
    this.alertService.info('Edit functionality coming soon!');
  }
}
