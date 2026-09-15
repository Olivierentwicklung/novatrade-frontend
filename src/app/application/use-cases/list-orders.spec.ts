import { vi } from 'vitest';

import { listOrders } from './list-orders';
import { OrderReadApi, OrderSummary } from '../ports/order-read-api';

describe('listOrders', () => {
  it('should load compact order summaries through the order api', async () => {
    const expectedOrders: OrderSummary[] = [
      {
        id: 'ORD-1001',
        status: 'Submitted',
        total: 129.99,
        itemCount: 1,
      },
      {
        id: 'ORD-1002',
        status: 'Draft',
        total: 99.98,
        itemCount: 2,
      },
    ];

    const orderApi: OrderReadApi = {
      getOrder: vi.fn(),
      listOrders: vi.fn().mockResolvedValue(expectedOrders),
    };

    const orders = await listOrders(orderApi);

    expect(orderApi.listOrders).toHaveBeenCalledOnce();
    expect(orders).toEqual(expectedOrders);
  });
});
