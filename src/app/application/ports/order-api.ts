import { Order } from '../../domain/order';
export interface OrderSummary {
  id: string;
  status: string;
  total: number;
  itemCount: number;
}

export interface OrderApi {
  placeOrder(orderId: string): Promise<void>;
  getOrder(orderId: string): Promise<Order>;
  listOrders(): Promise<OrderSummary[]>;
}
