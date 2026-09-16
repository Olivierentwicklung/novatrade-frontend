import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-order-review',
  template: `
    <p>Review order</p>

    <button
      type="button"
      aria-label="Place order"
      [disabled]="placementInProgress()"
      (click)="placeRequested.emit()"
    >
      @if (placementInProgress()) {
        Placing order...
      } @else {
        Place order
      }
    </button>
  `,
})
export class OrderReview {
  readonly placementInProgress = input(false);
  readonly placeRequested = output<void>();
}
