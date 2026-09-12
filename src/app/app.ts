import { Component, signal } from '@angular/core';
import { OrderEditor } from './order-editor/order-editor';
import { OrderReview } from './order-review/order-review';
import { Order } from './domain/order';
import { RestOrderApi } from './adapters/rest/rest-order-api';
import { placeOrder } from './application/place-order';
import { loadOrder } from './application/load-order';

@Component({
  selector: 'app-root',
  imports: [OrderEditor, OrderReview],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly step = signal<'edit' | 'review'>('edit');
  readonly order = signal<Order | null>(null);

  readonly checkoutEmail = signal('');
  readonly deliveryAddress = signal('');

  private readonly orderApi = new RestOrderApi(fetch);

  reviewOrder() {
    if (!this.hasValidCheckoutDetails()) {
      return;
    }

    this.step.set('review');
  }

  editOrder() {
    this.step.set('edit');
  }

  async placeCurrentOrder() {
    const order = this.order();

    if (!order) {
      return;
    }

    await placeOrder(order, this.orderApi);

    const authoritativeOrder = await loadOrder(order.id, this.orderApi);

    this.order.set(authoritativeOrder);
  }

  private hasValidCheckoutDetails(): boolean {
    const email = this.checkoutEmail().trim();
    const address = this.deliveryAddress().trim();

    return email.length > 0 && address.length > 0 && email.includes('@');
  }
}
