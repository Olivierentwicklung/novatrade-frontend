import { OrderApi } from '../../application/ports/order-api';
import { Order } from '../../domain/order';

export class InMemoryOrderApi implements OrderApi {
  readonly placedOrderIds: string[] = [];

  async placeOrder(orderId: string): Promise<void> {
    this.placedOrderIds.push(orderId);
  }

  async getOrder(orderId: string): Promise<Order> {
    throw new Error('Not implemented');
  }
}
