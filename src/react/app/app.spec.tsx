import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Order } from '../../core/domain/entities/order';
import { OrderLine } from '../../core/domain/value-objects/order-line';
import { App } from './app';

describe('React App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cancels a submitted order through the composed React application', async () => {
    const order = new Order('ORD-1002', 'Submitted', [new OrderLine('USB-C Hub', 1, 69.99)], 69.99);

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 200,
      }),
    );

    const user = userEvent.setup();

    render(<App order={order} />);

    await user.click(
      screen.getByRole('button', {
        name: /cancel order/i,
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/orders/ORD-1002/cancel',
      expect.objectContaining({
        method: 'POST',
      }),
    );

    expect(order.status).toBe('Cancelled');
  });
});
