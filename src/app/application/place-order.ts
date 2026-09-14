import { Order } from '../domain/order';
import { PlaceOrderApi } from './ports/place-order-api';

export async function placeOrder(order: Order, orderApi: PlaceOrderApi): Promise<void> {
  if (!order.canBePlaced()) {
    return;
  }

  await orderApi.placeOrder(order.id);

  order.place();
}
