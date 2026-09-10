import { Component } from '@angular/core';
import { calculateOrderTotal } from './calculate-order-total';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly order = {
    id: 'ORD-1001',
    status: 'Draft',
    lines: [
      {
        productName: 'Mechanical Keyboard',
        quantity: 1,
        unitPrice: 129.99,
      },
      {
        productName: 'Wireless Mouse',
        quantity: 2,
        unitPrice: 49.99,
      },
    ],
    total: 229.97,
  };

  increaseProductQuantity(productName: string) {
    const line = this.order.lines.find((item) => item.productName === productName);

    if (!line) {
      return;
    }

    line.quantity += 1;

    this.recalculateTotal();
  }

  removeProductFromOrder(productName: string) {
    this.order.lines = this.order.lines.filter((item) => item.productName !== productName);

    this.recalculateTotal();
  }

  decreaseProductQuantity(productName: string) {
    const line = this.order.lines.find((item) => item.productName === productName);

    if (!line || line.quantity <= 1) {
      return;
    }

    line.quantity -= 1;

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
