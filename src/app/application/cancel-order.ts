import { Order } from '../domain/order';
import { CancelOrderApi } from './ports/cancel-order-api';

export async function cancelOrder(order: Order, orderApi: CancelOrderApi): Promise<void> {
  await orderApi.cancelOrder(order.id);

  order.cancel();
}
