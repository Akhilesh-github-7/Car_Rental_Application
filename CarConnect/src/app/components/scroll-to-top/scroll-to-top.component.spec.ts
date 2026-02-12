import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ScrollToTopComponent } from './scroll-to-top.component';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subject } from 'rxjs';
import { ScrollService } from '../../services/scroll.service';
import { PLATFORM_ID } from '@angular/core';

describe('ScrollToTopComponent', () => {
  let component: ScrollToTopComponent;
  let fixture: ComponentFixture<ScrollToTopComponent>;
  let scrollServiceSpy: jasmine.SpyObj<ScrollService>;
  let routerEventsSubject: Subject<Event>;
  let routerSpy: any;

  beforeEach(async () => {
    scrollServiceSpy = jasmine.createSpyObj('ScrollService', ['scrollToTop']);
    routerEventsSubject = new Subject<Event>();
    routerSpy = {
      events: routerEventsSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [ScrollToTopComponent],
      providers: [
        { provide: ScrollService, useValue: scrollServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollToTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden initially', () => {
    expect(component.isVisible).toBeFalse();
    const button = fixture.nativeElement.querySelector('.scroll-to-top-btn');
    expect(button.classList.contains('show')).toBeFalse();
  });

  it('should show button when scrolled down', fakeAsync(() => {
    // Simulate scroll
    window.pageYOffset = 400;
    window.dispatchEvent(new Event('scroll'));
    
    tick(20); // wait for debounceTime(10)
    fixture.detectChanges();

    expect(component.isVisible).toBeTrue();
    const button = fixture.nativeElement.querySelector('.scroll-to-top-btn');
    expect(button.classList.contains('show')).toBeTrue();
  }));

  it('should call scrollService.scrollToTop when clicked', () => {
    component.isVisible = true;
    fixture.detectChanges();
    
    const button = fixture.nativeElement.querySelector('.scroll-to-top-btn');
    button.click();

    expect(scrollServiceSpy.scrollToTop).toHaveBeenCalledWith('smooth');
  });

  it('should automatically scroll to top on navigation end', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
    expect(scrollServiceSpy.scrollToTop).toHaveBeenCalledWith('auto');
  });
});
