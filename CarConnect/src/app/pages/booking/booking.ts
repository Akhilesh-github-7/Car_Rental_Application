import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { LocationService } from '../../services/location.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  carId: string | null = null;
  car: any;
  locations: any[] = [];
  isEditMode: boolean = false;
  isCarOwner: boolean = false;

  // Booking form data
  pickupDate: string = '';
  dropOffDate: string = '';
  startTime: string = '';
  selectedDistrict: string = ''; // District selected by user; cities dropdown shows cities for this district
  fromLocation: string = '';
  toLocation: string = '';
  pickupAddress: string = '';
  alternateContact: string = '';
  withDriver: boolean = false;

  // Edit form data
  editBrand: string = '';
  editName: string = '';
  editPricing: number | null = null;
  editPricingDescription: string = '';
  editLocationId: string | null = null;
  editRegisteredOn: string = '';
  editVehicleNo: string = '';
  editOwnerNumber: string = '';
  editImageUrl: string = '';
  editImageSource: 'url' | 'upload' = 'url';
  editSelectedFile: File | null = null;
  editCarAccessories: string[] = [];
  editNewAccessory: string = '';
  editSubmissionError: string | null = null;
  editSubmissionSuccess: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    private locationService: LocationService,
    private bookingService: BookingService,
    public authService: AuthService, // Made public for template access
    private alertService: AlertService
  ) {}

  allLocations: any[] = []; // Store all locations
  districts: any[] = []; // Store districts for location selection
  pickupDropOptions: { value: string; label: string }[] = []; // Cities or districts for pickup/drop dropdowns

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.carId = params['carId'];
      if (this.carId) {
        this.loadCarDetails(this.carId);
      }
    });

    // Load all locations first
    this.loadLocations();
    // Load districts for edit form
    this.loadDistricts();
  }

  loadDistricts() {
    this.locationService.getDistricts().subscribe({
      next: (res) => {
        if (res.result && res.data) {
          this.districts = res.data;
          this.updatePickupDropOptions();
        }
      },
      error: (err) => {
        console.error('Error loading districts:', err);
        this.districts = [];
        this.updatePickupDropOptions();
      }
    });
  }

  loadCarDetails(id: string) {
    this.carService.getCarById(id).subscribe({
      next: (res) => {
        if (res.result && res.data) {
          this.car = res.data;
          // Use the isOwner flag from backend if available, otherwise check locally
          if (this.car.isOwner !== undefined) {
            this.isCarOwner = this.car.isOwner;
          } else {
            // Fallback to local check
            this.checkIfCarOwner();
          }
          // Pre-select car's district and show its cities
          if (this.car.locationId) {
            this.selectedDistrict = String(this.car.locationId).trim();
            if (this.allLocations.length > 0) {
              this.filterLocationsByDistrict(this.selectedDistrict);
            } else {
              this.updatePickupDropOptions();
            }
          } else {
            this.updatePickupDropOptions();
          }
        } else {
          console.error('Car not found or invalid response:', res);
          this.car = null;
        }
      },
      error: (err) => {
        console.error('Error loading car details:', err);
        this.car = null;
      }
    });
  }

  checkIfCarOwner() {
    if (!this.authService.isLoggedIn() || !this.car) {
      this.isCarOwner = false;
      console.log('Car owner check failed: not logged in or no car');
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.isCarOwner = false;
      console.log('Car owner check failed: no user ID');
      return;
    }

    // Compare user ID with car's ownerUserId
    // ownerUserId can be MongoDB ObjectId string (new cars) or Number/String (old cars)
    if (this.car.ownerUserId) {
      // Convert both to strings and trim whitespace
      const ownerIdStr = String(this.car.ownerUserId).trim();
      const userIdStr = String(userId).trim();
      
      // Direct comparison (case-sensitive for ObjectIds)
      this.isCarOwner = ownerIdStr === userIdStr;
      
      // If not matching and ownerUserId is a number (legacy), check if user wants to edit their own cars
      // For existing cars with numeric ownerUserId, we'll allow editing if user is logged in
      // This is a temporary workaround for cars created before the fix
      if (!this.isCarOwner && !isNaN(Number(this.car.ownerUserId))) {
        // Legacy numeric ID - for now, if user is logged in, allow editing
        // TODO: Update existing cars in database to use actual MongoDB ObjectId
        // For security, you might want to add additional verification here
        const isNumericOwnerId = !isNaN(Number(this.car.ownerUserId)) && Number(this.car.ownerUserId) > 0;
        if (isNumericOwnerId) {
          // Temporary: Allow editing if user is logged in (assuming they own the car)
          // In production, you should update existing cars to have correct ownerUserId
          this.isCarOwner = true;
          console.warn('Legacy numeric ownerUserId detected. Allowing edit for logged-in user. Please update car records in database.');
        }
      }
    } else {
      this.isCarOwner = false;
    }
    
    console.log('Car owner check:', {
      userId,
      ownerUserId: this.car?.ownerUserId,
      ownerUserIdType: typeof this.car?.ownerUserId,
      isCarOwner: this.isCarOwner,
      isLoggedIn: this.authService.isLoggedIn()
    });
  }

  loadLocations() {
    this.locationService.getLocations().subscribe({
      next: (res) => {
        if (res.result && res.data) {
          this.allLocations = res.data;
          // If car is already loaded and we have a district selected, filter by it
          if (this.car && (this.selectedDistrict || this.car.locationId)) {
            const district = this.selectedDistrict || String(this.car.locationId).trim();
            this.filterLocationsByDistrict(district);
          } else {
            // If car not loaded yet, show all locations temporarily
            this.locations = this.allLocations;
          }
          this.updatePickupDropOptions();
        } else {
          this.allLocations = [];
          this.locations = [];
          this.updatePickupDropOptions();
        }
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        this.allLocations = [];
        this.locations = [];
        this.updatePickupDropOptions();
      }
    });
  }

  filterLocationsByDistrict(district: string) {
    // Use map and filter to get cities from the specific district
    this.locations = this.allLocations
      .map((loc: any) => loc) // Map to ensure we have the location object
      .filter((loc: any) => {
        // Filter by district field (case-insensitive)
        if (loc.district) {
          return loc.district.toLowerCase().trim() === district.toLowerCase().trim();
        }
        // If location doesn't have district field, exclude it
        return false;
      });
    this.updatePickupDropOptions();
    console.log(`Filtered ${this.locations.length} locations for district: ${district}`);
  }

  /**
   * Update pickup/drop dropdown options: cities from Location API for car's district,
   * or fallback to Kerala districts so the dropdown is never empty.
   */
  updatePickupDropOptions() {
    if (this.locations && this.locations.length > 0) {
      this.pickupDropOptions = this.locations.map((loc: any) => ({
        value: loc.city || loc.title,
        label: loc.city || loc.title || ''
      }));
    } else if (this.districts && this.districts.length > 0) {
      this.pickupDropOptions = this.districts.map((d: string) => ({ value: d, label: d }));
    } else {
      this.pickupDropOptions = [];
    }
  }

  /** When user changes district, show that district's cities in pickup/drop dropdowns */
  onDistrictChange() {
    this.fromLocation = '';
    this.toLocation = '';
    if (this.selectedDistrict && this.allLocations.length > 0) {
      this.filterLocationsByDistrict(this.selectedDistrict);
    } else {
      this.locations = [];
      this.updatePickupDropOptions();
    }
  }

  bookNow() {
    if (this.isCarOwner) {
      this.alertService.error('As the host, you cannot book your own car.');
      return;
    }

    const bookingDetails = {
      carId: this.carId,
      pickupDate: this.pickupDate,
      dropOffDate: this.dropOffDate,
      departureTime: this.startTime,
      locationId: this.fromLocation,
      pickupLocation: this.fromLocation,
      dropLocation: this.toLocation,
      pickupAddress: this.pickupAddress,
      alternateContact: this.alternateContact,
      withDriver: this.withDriver,
    };

    this.bookingService.createBooking(bookingDetails).subscribe({
      next: (res) => {
        if(res.result) {
          console.log('Booking successful:', res.data);
          this.alertService.success('Booking successful!');
          // Optionally, navigate to "My Bookings" page
        } else {
          console.error('Booking failed:', res.message);
          this.alertService.error(`Booking failed: ${res.message}`);
        }
      },
      error: (err) => {
        console.error('Error creating booking:', err);
        const errorMessage = err.error?.message || 'An error occurred while creating the booking.';
        this.alertService.error(errorMessage);
      }
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it's a relative path starting with /, return as is (proxy will handle it)
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    // Otherwise, assume it's a relative path and add /
    return '/' + imageUrl;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    // Set a placeholder image
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    img.onerror = null; // Prevent infinite loop
  }

  // Edit functionality
  enterEditMode() {
    if (!this.car) return;
    
    this.isEditMode = true;
    // Populate edit form with current car data
    this.editBrand = this.car.brand || '';
    this.editName = this.car.name || '';
    this.editPricing = this.car.pricing || null;
    this.editPricingDescription = this.car.pricingDescription || '';
    this.editLocationId = this.car.locationId ? String(this.car.locationId).trim() : null;
    this.editRegisteredOn = this.car.registeredOn || '';
    this.editVehicleNo = this.car.vehicleNo || '';
    this.editOwnerNumber = this.car.ownerNumber || '';
    this.editImageUrl = this.car.imageUrl || '';
    this.editCarAccessories = this.car.carAccessories?.map((acc: any) => acc.accessoriesTitle) || [];
    this.editSubmissionError = null;
    this.editSubmissionSuccess = null;
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editSubmissionError = null;
    this.editSubmissionSuccess = null;
  }

  onEditFileSelected(event: any): void {
    if (event.target.files && event.target.files[0]) {
      this.editSelectedFile = event.target.files[0];
      this.editImageUrl = ''; // Clear imageUrl if a file is selected
    }
  }

  addEditAccessory() {
    if (this.editNewAccessory.trim() !== '') {
      this.editCarAccessories.push(this.editNewAccessory.trim());
      this.editNewAccessory = '';
    }
  }

  removeEditAccessory(index: number) {
    this.editCarAccessories.splice(index, 1);
  }

  updateCar() {
    if (!this.carId) return;

    this.editSubmissionError = null;
    this.editSubmissionSuccess = null;

    const formData = new FormData();
    formData.append('brand', this.editBrand);
    formData.append('name', this.editName);
    formData.append('pricingDescription', this.editPricingDescription);
    if (this.editPricing) {
      formData.append('pricing', this.editPricing.toString());
    }
    if (this.editLocationId) {
      formData.append('locationId', this.editLocationId);
    }
    formData.append('registeredOn', this.editRegisteredOn);
    formData.append('vehicleNo', this.editVehicleNo);
    formData.append('ownerNumber', this.editOwnerNumber);
    
    // Add accessories
    this.editCarAccessories.forEach(acc => {
      formData.append('carAccessories', acc);
    });
    
    if (this.editImageSource === 'upload' && this.editSelectedFile) {
      formData.append('image', this.editSelectedFile, this.editSelectedFile.name);
    } else {
      formData.append('imageUrl', this.editImageUrl);
    }

    this.carService.updateCar(this.carId, formData).subscribe({
      next: (res) => {
        if (res.result) {
          this.editSubmissionSuccess = 'Car details updated successfully!';
          // Reload car details
          this.loadCarDetails(this.carId!);
          // Exit edit mode after a short delay
          setTimeout(() => {
            this.isEditMode = false;
            this.editSubmissionSuccess = null;
          }, 2000);
        } else {
          this.editSubmissionError = res.message || 'Failed to update car details';
        }
      },
      error: (err) => {
        console.error('Error updating car:', err);
        this.editSubmissionError = err.error?.message || 'An error occurred while updating the car.';
      }
    });
  }
}
