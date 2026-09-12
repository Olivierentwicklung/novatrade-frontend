import { vi } from 'vitest';
import { Order } from '../domain/order';
import { OrderLine } from '../domain/order-line';
import { loadOrder } from './load-order';

describe('loadOrder', () => {
  it('should load an order through the order api', async () => {
    const expectedOrder = new Order(
      'ORD-1001',
      'Draft',
      [new OrderLine('Mechanical Keyboard', 1, 129.99)],
      129.99,
    );

    const orderApi = {
      placeOrder: vi.fn().mockResolvedValue(undefined),
      getOrder: vi.fn().mockResolvedValue(expectedOrder),
    };

    const order = await loadOrder('ORD-1001', orderApi);

    expect(orderApi.getOrder).toHaveBeenCalledWith('ORD-1001');
    expect(order).toBe(expectedOrder);
  });
});
