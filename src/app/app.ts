import { Component, signal } from '@angular/core';
import { OrderEditor } from './order-editor/order-editor';
import { OrderReview } from './order-review/order-review';

@Component({
  selector: 'app-root',
  imports: [OrderEditor, OrderReview],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly step = signal<'edit' | 'review'>('edit');

  reviewOrder() {
    this.step.set('review');
  }

  editOrder() {
    this.step.set('edit');
  }
}
