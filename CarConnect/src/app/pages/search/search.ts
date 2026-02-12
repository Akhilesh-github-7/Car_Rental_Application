import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [FormsModule, CommonModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search implements OnInit {
  // Filters
  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedBrand: string = 'All';
  selectedLocation: string = '';
  sortBy: string = 'price_asc'; // 'price_asc', 'price_desc', 'newest'

  // Data
  brands: string[] = ['All'];
  districts: string[] = [];
  allCars: any[] = [];
  cars: any[] = [];
  
  // State
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private carService: CarService,
    private authService: AuthService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    // Fetch Kerala districts
    this.locationService.getDistricts().subscribe(res => {
      if (res.result && res.data) {
        this.districts = res.data;
      }
    });

    // Fetch cars
    this.carService.getCars().subscribe({
      next: (res) => {
        if (res.result && res.data) {
          this.allCars = res.data;
          this.updateBrandsFromCars(this.allCars);
          
          // Handle query params after data is loaded
          this.route.queryParams.subscribe(params => {
            if (params['location']) {
              this.selectedLocation = params['location'];
            }
            if (params['search']) {
              this.searchTerm = params['search'];
            }
            this.applyFilters();
          });
        } else {
          this.allCars = [];
          this.cars = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching cars:', err);
        this.allCars = [];
        this.cars = [];
        this.isLoading = false;
      }
    });
  }

  onViewDetailsClick(carId: string) {
    if (!this.authService.isLoggedIn()) {
      this.modalService.openLoginModal('Login to view car details');
      return;
    }
    this.router.navigate(['/booking'], { queryParams: { carId } });
  }

  private updateBrandsFromCars(cars: any[]) {
    const unique = new Set<string>();
    cars.forEach((car: any) => {
      if (car.brand && String(car.brand).trim()) {
        unique.add(String(car.brand).trim());
      }
    });
    this.brands = ['All', ...Array.from(unique).sort()];
  }

  applyFilters() {
    let result = this.allCars.slice();

    // 1. Search Term (Name or Brand)
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(car => 
        (car.name && car.name.toLowerCase().includes(term)) || 
        (car.brand && car.brand.toLowerCase().includes(term))
      );
    }

    // 2. Price Range
    const minVal = this.minPrice != null ? Number(this.minPrice) : NaN;
    if (!isNaN(minVal)) {
      result = result.filter((car: any) => Number(car.pricing) >= minVal);
    }
    const maxVal = this.maxPrice != null ? Number(this.maxPrice) : NaN;
    if (!isNaN(maxVal)) {
      result = result.filter((car: any) => Number(car.pricing) <= maxVal);
    }

    // 3. Brand
    if (this.selectedBrand && this.selectedBrand !== 'All') {
      const brand = String(this.selectedBrand).trim().toLowerCase();
      result = result.filter((car: any) => car.brand && String(car.brand).trim().toLowerCase() === brand);
    }

    // 4. Location
    if (this.selectedLocation && this.selectedLocation.trim() !== '') {
      const loc = String(this.selectedLocation).trim().toLowerCase();
      result = result.filter((car: any) => {
        // Match locationId or any part of it (if it contains city name)
        return car.locationId && String(car.locationId).toLowerCase().includes(loc);
      });
    }

    // 5. Sorting
    this.sortCars(result);

    this.cars = result;
  }

  sortCars(carsList: any[]) {
    switch (this.sortBy) {
      case 'price_asc':
        carsList.sort((a, b) => Number(a.pricing) - Number(b.pricing));
        break;
      case 'price_desc':
        carsList.sort((a, b) => Number(b.pricing) - Number(a.pricing));
        break;
      case 'newest':
        // Assuming registeredOn is a date string or timestamp, otherwise falling back to simple comparison
        // If it's just a year string, this might be approximate
        carsList.sort((a, b) => (b.registeredOn || '').localeCompare(a.registeredOn || ''));
        break;
      default:
        break;
    }
  }

  onSortChange() {
    this.applyFilters(); // Re-apply filters which includes sorting
  }

  clearFilters() {
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedBrand = 'All';
    this.selectedLocation = '';
    this.sortBy = 'price_asc';
    this.applyFilters();
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return this.getPlaceholderImage();
    }
    
    let trimmedUrl = String(imageUrl).trim();
    
    if (trimmedUrl.startsWith('http')) {
      return trimmedUrl;
    }
    
    // Use fromCharCode(92) to avoid backslash escaping issues in the tool
    const backslash = String.fromCharCode(92);
    trimmedUrl = trimmedUrl.split(backslash).join('/');
    
    if (trimmedUrl.startsWith('/')) {
      return trimmedUrl;
    }
    
    return '/' + trimmedUrl;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.getPlaceholderImage();
  }

  getPlaceholderImage(): string {
    // Simple SVG placeholder
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22280%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20280%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23AAAAAA%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22280%22%20height%3D%22200%22%20fill%3D%22%23EEEEEE%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2295%22%20y%3D%22105%22%3ECar%20Bee%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
  }
}
