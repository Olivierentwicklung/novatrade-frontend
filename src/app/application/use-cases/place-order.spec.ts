import { vi } from 'vitest';
import { Order } from '../../domain/entities/order';
import { OrderLine } from '../../domain/value-objects/order-line';
import { placeOrder } from './place-order';

import { PlaceOrderApi } from '../ports/place-order-api';

describe('placeOrder', () => {
  it('should ask the order to place itself', async () => {
    const order = new Order('ORD-1001', 'Draft', [new OrderLine('Test Product', 1, 20)], 20);

    const placeSpy = vi.spyOn(order, 'place');

    const orderApi: PlaceOrderApi = {
      placeOrder: vi.fn().mockResolvedValue(undefined),
    };

    await placeOrder(order, orderApi);

    expect(placeSpy).toHaveBeenCalledOnce();
  });

  it('should ask the order api to place the order', async () => {
    const order = new Order('ORD-1001', 'Draft', [new OrderLine('Test Product', 1, 20)], 20);

    const orderApi = {
      placeOrder: vi.fn().mockResolvedValue(undefined),
      getOrder: vi.fn(),
      listOrders: vi.fn().mockResolvedValue([]),
    };

    await placeOrder(order, orderApi);

    expect(orderApi.placeOrder).toHaveBeenCalledWith('ORD-1001');
  });

  it('should keep the order draft when the backend rejects placement', async () => {
    const order = new Order('ORD-1001', 'Draft', [new OrderLine('Test Product', 1, 20)], 20);

    const orderApi = {
      placeOrder: vi.fn().mockRejectedValue(new Error('Order placement rejected')),
      getOrder: vi.fn(),
      listOrders: vi.fn().mockResolvedValue([]),
    };

    await expect(placeOrder(order, orderApi)).rejects.toThrow('Order placement rejected');

    expect(order.status).toBe('Draft');
  });

  it('should not ask the backend to place an invalid order', async () => {
    const order = new Order('ORD-1001', 'Draft', [], 0);

    const orderApi = {
      placeOrder: vi.fn().mockResolvedValue(undefined),
      getOrder: vi.fn(),
      listOrders: vi.fn().mockResolvedValue([]),
    };

    await placeOrder(order, orderApi);

    expect(orderApi.placeOrder).not.toHaveBeenCalled();
    expect(order.status).toBe('Draft');
  });
});
