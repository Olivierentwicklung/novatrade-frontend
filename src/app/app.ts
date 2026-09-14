import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { email, form, FormField, required } from '@angular/forms/signals';
import { Location } from '@angular/common';

import { loadOrder } from './application/load-order';
import { placeOrder } from './application/place-order';
import { Order } from './domain/order';
import { OrderEditor } from './order-editor/order-editor';
import { OrderReview } from './order-review/order-review';
import { OrderList } from './order-list/order-list';

import { ORDER_API } from './application/ports/order-api.token';
import { OrderPlacementRejected } from './application/errors/order-placement-rejected';

import { listOrders } from './application/list-orders';
import { OrderSummary } from './application/ports/order-read-api';
import { cancelOrder } from './application/cancel-order';

interface CheckoutDetails {
  email: string;
  deliveryAddress: string;
}

@Component({
  selector: 'app-root',
  imports: [OrderEditor, OrderReview, OrderList, FormField],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly orderApi = inject(ORDER_API);

  readonly step = signal<'edit' | 'review'>('edit');
  readonly order = signal<Order | null>(null);
  readonly orders = signal<OrderSummary[]>([]);
  readonly ordersLoaded = signal(false);

  readonly placementError = signal<string | null>(null);

  readonly placementInProgress = signal(false);

  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

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
    this.restoreStepFromLocation();
    this.subscribeToLocationChanges();

    await this.loadInitialOrder();
  }

  reviewOrder() {
    if (this.checkoutForm().invalid()) {
      return;
    }

    this.step.set('review');
    this.location.go('/checkout/review');
  }

  editOrder() {
    this.step.set('edit');
    this.location.go('/checkout/edit');
  }

  async placeCurrentOrder(): Promise<void> {
    if (this.placementInProgress()) {
      return;
    }

    const order = this.order();

    if (!order) {
      return;
    }

    this.placementInProgress.set(true);
    this.placementError.set(null);

    try {
      await placeOrder(order, this.orderApi);

      const authoritativeOrder = await loadOrder(order.id, this.orderApi);

      this.order.set(authoritativeOrder);
    } catch (error) {
      if (error instanceof OrderPlacementRejected) {
        this.placementError.set('This order can no longer be placed.');

        return;
      }

      throw error;
    } finally {
      this.placementInProgress.set(false);
    }
  }

  async cancelCurrentOrder(): Promise<void> {
    const order = this.order();

    if (!order) {
      return;
    }

    await cancelOrder(order, this.orderApi);

    const authoritativeOrder = await loadOrder(order.id, this.orderApi);

    this.order.set(authoritativeOrder);
  }

  async selectOrder(orderId: string): Promise<void> {
    const order = await loadOrder(orderId, this.orderApi);
    this.order.set(order);
  }

  private restoreStepFromLocation(): void {
    this.step.set(this.location.path() === '/checkout/review' ? 'review' : 'edit');
  }

  private subscribeToLocationChanges(): void {
    const locationSubscription = this.location.subscribe(() => {
      this.restoreStepFromLocation();
    });

    this.destroyRef.onDestroy(() => {
      locationSubscription.unsubscribe();
    });
  }
  private async loadInitialOrder(): Promise<void> {
    const orders = await listOrders(this.orderApi);

    this.orders.set(orders);
    this.ordersLoaded.set(true);

    const firstOrder = orders[0];

    if (!firstOrder) {
      return;
    }

    const order = await loadOrder(firstOrder.id, this.orderApi);

    this.order.set(order);
  }
}
