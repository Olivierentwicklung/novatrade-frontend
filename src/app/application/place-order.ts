import { Order } from '../order';
import { OrderApi } from './order-api';

export async function placeOrder(order: Order, orderApi?: OrderApi): Promise<void> {
  order.place();

  if (orderApi) {
    await orderApi.placeOrder(order.id);
    return;
  }

  await fetch(`/api/orders/${order.id}/place/`, {
    method: 'POST',
  });
}
