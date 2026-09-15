import { Component, computed, input, output } from '@angular/core';

import { calculateOrderTotal } from '../../domain/calculate-order-total';
import { Order } from '../../domain/entities/order';
import { OrderLine } from '../../domain/value-objects/order-line';

@Component({
  selector: 'app-order-editor',
  templateUrl: './order-editor.html',
  styleUrl: './order-editor.css',
})
export class OrderEditor {
  readonly order = input<Order | null>(null);
  readonly orderChange = output<Order | null>();

  readonly total = computed(() => {
    const order = this.order();

    if (!order) {
      return 0;
    }

    return calculateOrderTotal(order.lines);
  });

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
}
