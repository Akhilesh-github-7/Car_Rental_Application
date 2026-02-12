import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MyHostedBookings } from './my-hosted-bookings';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { ScrollService } from '../../services/scroll.service';
import { of } from 'rxjs';

describe('MyHostedBookings', () => {
  let component: MyHostedBookings;
  let fixture: ComponentFixture<MyHostedBookings>;
  let scrollServiceSpy: jasmine.SpyObj<ScrollService>;
  let bookingServiceSpy: jasmine.SpyObj<BookingService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;

  beforeEach(async () => {
    scrollServiceSpy = jasmine.createSpyObj('ScrollService', ['scrollToTop', 'scrollToElement']);
    bookingServiceSpy = jasmine.createSpyObj('BookingService', ['getMyHostedBookings']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    alertServiceSpy = jasmine.createSpyObj('AlertService', ['confirm', 'success', 'error']);

    authServiceSpy.isLoggedIn.and.returnValue(true);
    bookingServiceSpy.getMyHostedBookings.and.returnValue(of({ result: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [MyHostedBookings],
      providers: [
        { provide: ScrollService, useValue: scrollServiceSpy },
        { provide: BookingService, useValue: bookingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AlertService, useValue: alertServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyHostedBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should scroll to top when tab is changed', fakeAsync(() => {
    component.setActiveTab('past');
    tick(50);
    expect(scrollServiceSpy.scrollToTop).toHaveBeenCalledWith('smooth');
    expect(scrollServiceSpy.scrollToElement).toHaveBeenCalledWith('hosted-bookings-top', 'smooth');
  }));
});
