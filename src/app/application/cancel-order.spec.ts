import { vi } from 'vitest';

import { Order } from '../domain/order';
import { OrderLine } from '../domain/order-line';
import { cancelOrder } from './cancel-order';
import { CancelOrderApi } from './ports/cancel-order-api';

describe('cancelOrder', () => {
  it('should ask the order api to cancel a submitted order', async () => {
    const order = new Order('ORD-1001', 'Submitted', [new OrderLine('Test Product', 1, 20)], 20);

    const orderApi: CancelOrderApi = {
      cancelOrder: vi.fn().mockResolvedValue(undefined),
    };

    await cancelOrder(order, orderApi);

    expect(orderApi.cancelOrder).toHaveBeenCalledWith('ORD-1001');
  });

  it('should ask the order to cancel itself', async () => {
    const order = new Order('ORD-1001', 'Submitted', [new OrderLine('Test Product', 1, 20)], 20);

    const cancelSpy = vi.spyOn(order, 'cancel');

    const orderApi: CancelOrderApi = {
      cancelOrder: vi.fn().mockResolvedValue(undefined),
    };

    await cancelOrder(order, orderApi);

    expect(cancelSpy).toHaveBeenCalledOnce();
  });
});
