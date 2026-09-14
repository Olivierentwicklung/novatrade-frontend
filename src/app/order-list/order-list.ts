import { Component, input, output } from '@angular/core';

import { OrderSummary } from '../application/ports/order-read-api';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.html',
})
export class OrderList {
  readonly orders = input.required<OrderSummary[]>();

  readonly orderSelected = output<string>();

  selectOrder(orderId: string): void {
    this.orderSelected.emit(orderId);
  }
}
