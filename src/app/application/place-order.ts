import { Order } from '../domain/order';
import { OrderWriteApi } from './ports/order-write-api';

export async function placeOrder(order: Order, orderApi: OrderWriteApi): Promise<void> {
  if (!order.canBePlaced()) {
    return;
  }

  await orderApi.placeOrder(order.id);

  order.place();
}
