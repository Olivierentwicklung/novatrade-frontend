import { afterEach, describe, expect, it, vi } from 'vitest';

import { createOrderApi } from './order-api';
import { Order } from '../../core/domain/entities/order';
import { OrderLine } from '../../core/domain/value-objects/order-line';

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

  it('loads an order through the REST backend contract', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 'ORD-1002',
          status: 'Submitted',
          lines: [
            {
              product_name: 'USB-C Hub',
              quantity: 1,
              unit_price: 69.99,
            },
            {
              product_name: 'USB-C Cable',
              quantity: 2,
              unit_price: 19.99,
            },
          ],
          total: 109.97,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const orderApi = createOrderApi();

    const order = await orderApi.getOrder('ORD-1002');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/orders/ORD-1002');

    expect(order).toEqual(
      new Order(
        'ORD-1002',
        'Submitted',
        [new OrderLine('USB-C Hub', 1, 69.99), new OrderLine('USB-C Cable', 2, 19.99)],
        109.97,
      ),
    );
  });

  it('lists compact order summaries through the REST backend contract', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 'ORD-1001',
            status: 'Submitted',
            lines: [
              {
                product_name: 'Mechanical Keyboard',
                quantity: 1,
                unit_price: 129.99,
              },
            ],
            total: 129.99,
          },
          {
            id: 'ORD-1002',
            status: 'Draft',
            lines: [
              {
                product_name: 'Wireless Mouse',
                quantity: 2,
                unit_price: 49.99,
              },
              {
                product_name: 'USB-C Cable',
                quantity: 1,
                unit_price: 19.99,
              },
            ],
            total: 119.97,
          },
        ]),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const orderApi = createOrderApi();

    await expect(orderApi.listOrders()).resolves.toEqual([
      {
        id: 'ORD-1001',
        status: 'Submitted',
        total: 129.99,
        itemCount: 1,
      },
      {
        id: 'ORD-1002',
        status: 'Draft',
        total: 119.97,
        itemCount: 2,
      },
    ]);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/orders');
  });
});
