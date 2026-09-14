import { Order } from '../../domain/order';
import { OrderSummary } from './order-api';

export interface OrderReadApi {
  getOrder(orderId: string): Promise<Order>;
  listOrders(): Promise<OrderSummary[]>;
}
