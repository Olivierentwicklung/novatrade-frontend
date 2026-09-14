import { OrderSummary } from './ports/order-api';
import { OrderReadApi } from './ports/order-read-api';

export async function listOrders(orderApi: OrderReadApi): Promise<OrderSummary[]> {
  return orderApi.listOrders();
}
