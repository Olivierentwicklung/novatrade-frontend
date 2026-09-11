import { Order } from '../order';

export function placeOrder(order: Order): void {
  order.place();
}
