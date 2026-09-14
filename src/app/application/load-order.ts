import { Order } from '../domain/order';
import { OrderReadApi } from './ports/order-read-api';

export async function loadOrder(orderId: string, orderApi: OrderReadApi): Promise<Order> {
  return orderApi.getOrder(orderId);
}
