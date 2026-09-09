import { Component } from '@angular/core';

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

  increaseQuantity(productName: string) {
    const line = this.order.lines.find((item) => item.productName === productName);

    if (!line) {
      return;
    }

    line.quantity += 1;

    this.order.total = this.order.lines.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
  }
}
