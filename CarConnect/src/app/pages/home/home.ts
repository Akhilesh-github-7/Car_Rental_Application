import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { CarService } from '../../services/car.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  location: string = '';
  locations: any[] = [];
  allLocations: any[] = [];
  featuredCars: any[] = [];
  showDropdown = false;

  constructor(
    private router: Router, 
    private locationService: LocationService,
    private carService: CarService
  ) {}

  ngOnInit() {
    this.loadLocations();
    this.loadFeaturedCars();
  }

  loadLocations() {
    this.locationService.getLocations().subscribe(res => {
      if (res.result) {
        this.allLocations = res.data;
      }
    });
  }

  loadFeaturedCars() {
    this.carService.getCars().subscribe(res => {
      if (res.result) {
        // Take the first 3 cars as featured
        this.featuredCars = res.data.slice(0, 3);
      }
    });
  }

  onLocationInput() {
    if (this.location.length > 1) {
      this.locations = this.allLocations.filter(loc => 
        loc.city.toLowerCase().includes(this.location.toLowerCase()) ||
        loc.title.toLowerCase().includes(this.location.toLowerCase())
      );
      this.showDropdown = this.locations.length > 0;
    } else {
      this.locations = [];
      this.showDropdown = false;
    }
  }

  selectLocation(location: any) {
    this.location = location.city;
    this.locations = [];
    this.showDropdown = false;
  }

  onSearch() {
    this.router.navigate(['/search'], { queryParams: { location: this.location } });
  }

  viewCarDetails(carId: string) {
    this.router.navigate(['/car', carId]);
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
    const trimmed = String(imageUrl).trim();
    if (trimmed.startsWith('http')) return trimmed;
    
    // Fix backslashes
    const backslash = String.fromCharCode(92);
    const sanitized = trimmed.split(backslash).join('/');
    return sanitized.startsWith('/') ? environment.baseUrl + sanitized : environment.baseUrl + '/' + sanitized;
  }
}
