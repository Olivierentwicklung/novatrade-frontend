import { Order } from '../domain/order';
import { OrderApi } from './ports/order-api';

export async function placeOrder(order: Order, orderApi?: OrderApi): Promise<void> {
  if (orderApi) {
    await orderApi.placeOrder(order.id);
    order.place();
    return;
  }

  order.place();

  await fetch(`/api/orders/${order.id}/place/`, {
    method: 'POST',
  });
}
