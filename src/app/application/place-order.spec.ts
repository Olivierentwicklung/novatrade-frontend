import { vi } from 'vitest';
import { Order } from '../order';
import { OrderLine } from '../order-line';
import { placeOrder } from './place-order';

describe('placeOrder', () => {
  it('should ask the order to place itself', () => {
    const order = new Order('ORD-1001', 'Draft', [new OrderLine('Test Product', 1, 20)], 20);

    const placeSpy = vi.spyOn(order, 'place');

    placeOrder(order);

    expect(placeSpy).toHaveBeenCalledOnce();
  });
});
