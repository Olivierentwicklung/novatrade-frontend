import { Order } from '../../../core/domain/entities/order';
export interface OrderSummary {
  id: string;
  status: string;
  total: number;
  itemCount: number;
}

export interface OrderReadApi {
  getOrder(orderId: string): Promise<Order>;
  listOrders(): Promise<OrderSummary[]>;
}
