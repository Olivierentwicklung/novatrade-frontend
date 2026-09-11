import { Order } from '../order';

export async function placeOrder(order: Order): Promise<void> {
  order.place();

  await fetch(`/api/orders/${order.id}/place/`, {
    method: 'POST',
  });
}
