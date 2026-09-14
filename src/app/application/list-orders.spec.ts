import { vi } from 'vitest';

import { listOrders } from './list-orders';

describe('listOrders', () => {
  it('should load compact order summaries through the order api', async () => {
    const expectedOrders = [
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

    const orderApi = {
      getOrder: vi.fn(),
      placeOrder: vi.fn(),
      listOrders: vi.fn().mockResolvedValue(expectedOrders),
    };

    const orders = await listOrders(orderApi);

    expect(orderApi.listOrders).toHaveBeenCalledOnce();
    expect(orders).toEqual(expectedOrders);
  });
});
