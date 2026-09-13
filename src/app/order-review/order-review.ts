import { Component, output } from '@angular/core';

@Component({
  selector: 'app-order-review',
  template: `
    <p>Review order</p>

    <button type="button" aria-label="Place order" (click)="placeRequested.emit()">
      Place order
    </button>
  `,
})
export class OrderReview {
  readonly placeRequested = output<void>();
}
