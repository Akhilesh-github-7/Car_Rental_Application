import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private platformId = inject(PLATFORM_ID);

  scrollToTop(behavior: 'smooth' | 'auto' = 'smooth') {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({
        top: 0,
        behavior: behavior
      });
    }
  }

  scrollToElement(elementId: string, behavior: 'smooth' | 'auto' = 'smooth') {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior, block: 'start' });
      }
    }
  }

  scrollToTopInContainer(selector: string, behavior: 'smooth' | 'auto' = 'smooth') {
    if (isPlatformBrowser(this.platformId)) {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollTo({ top: 0, behavior });
      }
    }
  }
}
