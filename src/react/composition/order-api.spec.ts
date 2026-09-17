import { afterEach, describe, expect, it, vi } from 'vitest';

import { createOrderApi } from './order-api';

describe('React OrderApi composition', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cancels an order through the REST backend contract', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 200,
      }),
    );

    const orderApi = createOrderApi();

    await orderApi.cancelOrder('ORD-1002');

    expect(fetchMock).toHaveBeenCalledWith('/api/orders/ORD-1002/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  });

  it('rejects when the backend rejects the cancellation', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 500,
      }),
    );

    const orderApi = createOrderApi();

    await expect(orderApi.cancelOrder('ORD-1002')).rejects.toThrow(
      'Failed to cancel order ORD-1002.',
    );
  });
});
