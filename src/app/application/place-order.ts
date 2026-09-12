import { Order } from '../domain/order';
import { OrderApi } from './ports/order-api';

export async function placeOrder(order: Order, orderApi: OrderApi): Promise<void> {
  if (!order.canBePlaced()) {
    return;
  }

  await orderApi.placeOrder(order.id);

  order.place();
}
