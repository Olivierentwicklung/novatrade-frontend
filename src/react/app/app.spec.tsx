import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './app';

describe('React App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and cancels an order through the composed React application', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
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
      )
      .mockResolvedValueOnce(
        new Response(null, {
          status: 200,
        }),
      );

    const user = userEvent.setup();

    render(<App orderId="ORD-1002" />);

    expect(await screen.findByText('ORD-1002')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /cancel order/i,
      }),
    );

    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/orders/ORD-1002');

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/orders/ORD-1002/cancel',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });
});
