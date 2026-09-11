import { OrderApi } from '../application/order-api';

export class InMemoryOrderApi implements OrderApi {
  readonly placedOrderIds: string[] = [];

  async placeOrder(orderId: string): Promise<void> {}
}
