import { Order } from '../../domain/order';

export interface OrderApi {
  placeOrder(orderId: string): Promise<void>;
  getOrder(orderId: string): Promise<Order>;
}
