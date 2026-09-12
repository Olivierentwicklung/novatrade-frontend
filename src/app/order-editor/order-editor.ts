import { Component, computed, input, OnInit, output } from '@angular/core';
import { loadOrder } from '../application/load-order';
import { placeOrder } from '../application/place-order';
import { RestOrderApi } from '../adapters/rest/rest-order-api';
import { calculateOrderTotal } from '../domain/calculate-order-total';
import { Order } from '../domain/order';
import { OrderLine } from '../domain/order-line';

@Component({
  selector: 'app-order-editor',
  templateUrl: './order-editor.html',
  styleUrl: './order-editor.css',
})
export class OrderEditor implements OnInit {
  readonly order = input<Order | null>(null);
  readonly orderChange = output<Order | null>();
  private readonly orderApi = new RestOrderApi(fetch);

  readonly total = computed(() => {
    const order = this.order();

    if (!order) {
      return 0;
    }

    return calculateOrderTotal(order.lines);
  });

  async ngOnInit() {
    // await this.loadOrder();
  }

  increaseProductQuantity(productName: string) {
    const order = this.order();

    if (!order) {
      return;
    }

    this.orderChange.emit(
      new Order(
        order.id,
        order.status,
        order.lines.map((line) =>
          line.productName === productName
            ? new OrderLine(line.productName, line.quantity + 1, line.unitPrice)
            : line,
        ),
        order.total,
      ),
    );
  }

  decreaseProductQuantity(productName: string) {
    const order = this.order();

    if (!order) {
      return;
    }

    this.orderChange.emit(
      new Order(
        order.id,
        order.status,
        order.lines.map((line) => {
          if (line.productName !== productName || line.quantity <= 1) {
            return line;
          }

          return new OrderLine(line.productName, line.quantity - 1, line.unitPrice);
        }),
        order.total,
      ),
    );
  }

  removeProductFromOrder(productName: string) {
    const order = this.order();

    if (!order) {
      return;
    }

    this.orderChange.emit(
      new Order(
        order.id,
        order.status,
        order.lines.filter((line) => line.productName !== productName),
        order.total,
      ),
    );
  }

  async placeOrder() {
    const order = this.order();

    if (!order) {
      return;
    }

    await placeOrder(order, this.orderApi);

    this.orderChange.emit(new Order(order.id, order.status, order.lines, order.total));
  }

  async loadOrder() {
    const order = await loadOrder('ORD-1001', this.orderApi);

    this.orderChange.emit(order);
  }
}
