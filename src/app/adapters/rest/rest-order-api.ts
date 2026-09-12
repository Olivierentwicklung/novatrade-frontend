import { OrderApi } from '../../application/ports/order-api';
import { Order } from '../../domain/order';

type Fetch = (input: string, init?: RequestInit) => Promise<unknown>;

export class RestOrderApi implements OrderApi {
  constructor(private readonly fetch: Fetch) {}

  async placeOrder(orderId: string): Promise<void> {
    await this.fetch(`/api/orders/${orderId}/place/`, {
      method: 'POST',
    });
  }

  async getOrder(orderId: string): Promise<Order> {
    throw new Error('Not implemented');
  }
}
