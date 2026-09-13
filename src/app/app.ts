import { Component, inject, OnInit, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';

import { loadOrder } from './application/load-order';
import { placeOrder } from './application/place-order';
import { Order } from './domain/order';
import { OrderEditor } from './order-editor/order-editor';
import { OrderReview } from './order-review/order-review';

import { ORDER_API } from './application/ports/order-api.token';

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
export class App implements OnInit {
  private readonly orderApi = inject(ORDER_API);

  readonly step = signal<'edit' | 'review'>('edit');
  readonly order = signal<Order | null>(null);
  readonly placementError = signal<string | null>(null);

  readonly checkoutModel = signal<CheckoutDetails>({
    email: '',
    deliveryAddress: '',
  });

  readonly checkoutForm = form(this.checkoutModel, (checkout) => {
    required(checkout.email, {
      message: 'Email is required',
    });

    email(checkout.email, {
      message: 'Enter a valid email address',
    });

    required(checkout.deliveryAddress, {
      message: 'Delivery address is required',
    });
  });

  async ngOnInit(): Promise<void> {
    const order = await loadOrder('ORD-1001', this.orderApi);

    this.order.set(order);
  }

  reviewOrder() {
    if (this.checkoutForm().invalid()) {
      return;
    }

    this.step.set('review');
  }

  editOrder() {
    this.step.set('edit');
  }

  async placeCurrentOrder(): Promise<void> {
    const order = this.order();

    if (!order) {
      return;
    }

    this.placementError.set(null);

    try {
      await placeOrder(order, this.orderApi);

      const authoritativeOrder = await loadOrder(order.id, this.orderApi);

      this.order.set(authoritativeOrder);
    } catch (error) {
      if (error instanceof Error && error.message === 'Order placement rejected') {
        this.placementError.set('This order can no longer be placed.');

        return;
      }

      throw error;
    }
  }
}
