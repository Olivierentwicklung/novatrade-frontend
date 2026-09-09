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
}
