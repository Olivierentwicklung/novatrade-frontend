import { OrderApi } from '../../application/ports/order-api';

export class InMemoryOrderApi implements OrderApi {
  readonly placedOrderIds: string[] = [];

  async placeOrder(orderId: string): Promise<void> {
    this.placedOrderIds.push(orderId);
  }
}
