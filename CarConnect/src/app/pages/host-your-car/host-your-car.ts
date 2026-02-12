import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { NewCarService } from '../../services/new-car.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { ScrollService } from '../../services/scroll.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-host-your-car',
  imports: [CommonModule, FormsModule],
  templateUrl: './host-your-car.html',
  styleUrl: './host-your-car.css',
})
export class HostYourCar implements OnInit {
  private scrollService = inject(ScrollService);
  locations: any[] = [];
  currentStep = 1;
  totalSteps = 3;
  isLoading = signal(false);

  // Form data for listing a new car
  brand: string = '';
  name: string = '';
  pricingDescription: string = 'per day';
  pricing: number | null = null;
  locationId: string = ''; // Changed to string to match select value type usually
  registeredOn: string = '';
  imageUrl: string = '';
  vehicleNo: string = '';
  imageSource: 'url' | 'upload' = 'upload'; // Default to upload
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  carAccessories: string[] = [];
  newAccessory: string = '';
  ownerNumber: string = '';
  
  submissionError = signal<string | null>(null);
  submissionSuccess = signal<string | null>(null);
  
  constructor(
    private locationService: LocationService,
    private newCarService: NewCarService,
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    this.locationService.getDistricts().subscribe(res => {
      if (res.result) {
        this.locations = res.data;
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.selectedFile = event.target.files[0];
      this.imageUrl = ''; // Clear imageUrl if a file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile as Blob);
    }
  }

  onUrlChange() {
    if (this.imageUrl && this.imageSource === 'url') {
      this.imagePreview = this.imageUrl;
    } else if (!this.imageUrl) {
      this.imagePreview = null;
    }
  }

  addAccessory() {
    if (this.newAccessory.trim() !== '') {
      if (!this.carAccessories.includes(this.newAccessory.trim())) {
        this.carAccessories.push(this.newAccessory.trim());
      }
      this.newAccessory = '';
    }
  }

  removeAccessory(index: number) {
    this.carAccessories.splice(index, 1);
  }

  nextStep() {
    if (this.validateStep(this.currentStep)) {
      this.currentStep++;
      this.submissionError.set(null);
      setTimeout(() => {
        this.scrollService.scrollToTop('smooth');
        this.scrollService.scrollToElement('host-car-top', 'smooth');
      }, 50);
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.submissionError.set(null);
      setTimeout(() => {
        this.scrollService.scrollToTop('smooth');
        this.scrollService.scrollToElement('host-car-top', 'smooth');
      }, 50);
    }
  }

  validateStep(step: number): boolean {
    switch (step) {
      case 1: // Basics
        if (!this.brand || !this.name || !this.vehicleNo || !this.registeredOn) {
          this.submissionError.set('Please fill in all required fields.');
          return false;
        }
        return true;
      case 2: // Details
        if (!this.pricing || !this.locationId || !this.ownerNumber) {
          this.submissionError.set('Please fill in all required fields.');
          return false;
        }
        if (this.ownerNumber.length < 10) {
          this.submissionError.set('Please enter a valid owner phone number (at least 10 digits).');
          return false;
        }
        return true;
      case 3: // Images
        if (this.imageSource === 'url' && !this.imageUrl) {
           this.submissionError.set('Please provide an image URL.');
           return false;
        }
        if (this.imageSource === 'upload' && !this.selectedFile) {
           this.submissionError.set('Please upload an image.');
           return false;
        }
        return true;
      default:
        return false;
    }
  }

  listCar() {
    if (!this.authService.isLoggedIn()) {
      this.modalService.openLoginModal('Login to host your car');
      return;
    }

    if (!this.validateStep(3)) return;

    this.isLoading.set(true);
    this.submissionError.set(null);
    
    const formData = new FormData();

    formData.append('brand', this.brand);
    formData.append('name', this.name);
    formData.append('pricingDescription', this.pricingDescription);
    if (this.pricing) formData.append('pricing', this.pricing.toString());
    formData.append('locationId', this.locationId);
    formData.append('registeredOn', this.registeredOn);
    formData.append('vehicleNo', this.vehicleNo);
    formData.append('ownerNumber', this.ownerNumber);
    
    const userId = this.authService.getUserId();
    if (userId) {
      formData.append('ownerUserId', userId);
    } else {
      this.submissionError.set('User session expired. Please login again.');
      this.isLoading.set(false);
      return;
    }
    
    this.carAccessories.forEach(acc => {
      formData.append('carAccessories', acc);
    });
    
    if (this.imageSource === 'upload' && this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    } else {
      formData.append('imageUrl', this.imageUrl);
    }
    
    this.newCarService.createCar(formData).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if(res.result) {
          this.submissionSuccess.set('Car listed successfully! Redirecting...');
          setTimeout(() => {
            this.router.navigate(['/search']); // Or my-cars page if it existed
          }, 2000);
        } else {
          this.submissionError.set(res.message || 'Failed to list car.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error listing car:', err);
        this.submissionError.set(err.error?.message || 'An unknown error occurred.');
      }
    });
  }
}
