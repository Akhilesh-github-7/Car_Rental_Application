import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.css'
})
export class ScrollToTopComponent implements OnInit, OnDestroy {
  isVisible = false;
  private scrollSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private scrollService = inject(ScrollService);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Show/hide button based on scroll position with debounce
      this.scrollSubscription = fromEvent(window, 'scroll')
        .pipe(
          debounceTime(10),
          map(() => window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0)
        )
        .subscribe(scrollTop => {
          this.isVisible = scrollTop > 300;
        });

      // Automatically scroll to top on route change
      this.routeSubscription = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.scrollService.scrollToTop('auto');
        });
    }
  }

  ngOnDestroy() {
    this.scrollSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  scrollToTop() {
    this.scrollService.scrollToTop('smooth');
  }
}
