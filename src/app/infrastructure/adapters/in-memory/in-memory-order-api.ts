import { OrderApi } from '../../../application/ports/order-api';
import { OrderSummary } from '../../../application/ports/order-read-api';
import { Order } from '../../../../core/domain/entities/order';

export class InMemoryOrderApi implements OrderApi {
  readonly placedOrderIds: string[] = [];
  readonly cancelledOrderIds: string[] = [];

  async placeOrder(orderId: string): Promise<void> {
    this.placedOrderIds.push(orderId);
  }

  async cancelOrder(orderId: string): Promise<void> {
    this.cancelledOrderIds.push(orderId);
  }

  async getOrder(orderId: string): Promise<Order> {
    throw new Error('Not implemented');
  }

  async listOrders(): Promise<OrderSummary[]> {
    throw new Error('Method not implemented.');
  }
}
