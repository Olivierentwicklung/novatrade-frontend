import { Component, signal } from '@angular/core';
import { calculateOrderTotal } from './domain/calculate-order-total';
import { OrderLine } from './domain/order-line';
import { Order } from './domain/order';
import { placeOrder } from './application/place-order';
import { RestOrderApi } from './adapters/rest/rest-order-api';
import { loadOrder } from './application/load-order';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly order = signal<Order | null>(null);
  private readonly orderApi = new RestOrderApi(fetch);

  increaseProductQuantity(productName: string) {
    const order = this.order();

    if (!order) {
      return;
    }

    order.lines = order.lines.map((line) =>
      line.productName === productName
        ? new OrderLine(line.productName, line.quantity + 1, line.unitPrice)
        : line,
    );

    this.recalculateTotal();
  }

  removeProductFromOrder(productName: string) {
    const order = this.order();

    if (!order) {
      return;
    }
    order.lines = order.lines.filter((item) => item.productName !== productName);

    this.recalculateTotal();
  }

  decreaseProductQuantity(productName: string) {
    const order = this.order();

    if (!order) {
      return;
    }
    order.lines = order.lines.map((line) => {
      if (line.productName !== productName || line.quantity <= 1) {
        return line;
      }

      return new OrderLine(line.productName, line.quantity - 1, line.unitPrice);
    });

    this.recalculateTotal();
  }

  placeOrder() {
    const order = this.order();

    if (!order) {
      return;
    }

    placeOrder(order, this.orderApi);
  }

  async loadOrder() {
    const order = await loadOrder('ORD-1001', this.orderApi);

    this.order.set(order);
  }

  private recalculateTotal() {
    const order = this.order();

    if (!order) {
      return;
    }

    order.total = calculateOrderTotal(order.lines);
  }
}
