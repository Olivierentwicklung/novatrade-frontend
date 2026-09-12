import { Component, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { RestOrderApi } from './adapters/rest/rest-order-api';
import { loadOrder } from './application/load-order';
import { placeOrder } from './application/place-order';
import { Order } from './domain/order';
import { OrderEditor } from './order-editor/order-editor';
import { OrderReview } from './order-review/order-review';

interface CheckoutDetails {
  email: string;
  deliveryAddress: string;
}

@Component({
  selector: 'app-root',
  imports: [OrderEditor, OrderReview, FormField],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly step = signal<'edit' | 'review'>('edit');
  readonly order = signal<Order | null>(null);

  readonly checkoutModel = signal<CheckoutDetails>({
    email: '',
    deliveryAddress: '',
  });

  readonly checkoutForm = form(this.checkoutModel, (checkout) => {
    required(checkout.email);
    email(checkout.email);

    required(checkout.deliveryAddress);
  });

  private readonly orderApi = new RestOrderApi(fetch);

  reviewOrder() {
    if (this.checkoutForm().invalid()) {
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
}
