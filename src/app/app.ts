import { Component } from '@angular/core';
import { calculateOrderTotal } from './calculate-order-total';
import { OrderLine } from './order-line';
import { Order } from './order';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly order = new Order(
    'ORD-1001',
    'Draft',
    [new OrderLine('Mechanical Keyboard', 1, 129.99), new OrderLine('Wireless Mouse', 2, 49.99)],
    229.97,
  );

  increaseProductQuantity(productName: string) {
    this.order.lines = this.order.lines.map((line) =>
      line.productName === productName
        ? new OrderLine(line.productName, line.quantity + 1, line.unitPrice)
        : line,
    );

    this.recalculateTotal();
  }

  removeProductFromOrder(productName: string) {
    this.order.lines = this.order.lines.filter((item) => item.productName !== productName);

    this.recalculateTotal();
  }

  decreaseProductQuantity(productName: string) {
    this.order.lines = this.order.lines.map((line) => {
      if (line.productName !== productName || line.quantity <= 1) {
        return line;
      }

      return new OrderLine(line.productName, line.quantity - 1, line.unitPrice);
    });

    this.recalculateTotal();
  }

  placeOrder() {
    if (this.order.status !== 'Draft' || this.order.lines.length === 0) {
      return;
    }

    this.order.status = 'Submitted';
  }

  private recalculateTotal() {
    this.order.total = calculateOrderTotal(this.order.lines);
  }
}
