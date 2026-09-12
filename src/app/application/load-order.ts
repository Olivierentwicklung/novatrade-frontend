import { Order } from '../domain/order';
import { OrderApi } from './ports/order-api';

export async function loadOrder(orderId: string, orderApi: OrderApi): Promise<Order> {
  return orderApi.getOrder(orderId);
}
