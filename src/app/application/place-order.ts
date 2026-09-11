import { Order } from '../order';

export async function placeOrder(
  order: Order,
  orderApi?: {
    placeOrder(orderId: string): Promise<void>;
  },
): Promise<void> {
  order.place();

  await fetch(`/api/orders/${order.id}/place/`, {
    method: 'POST',
  });
}
