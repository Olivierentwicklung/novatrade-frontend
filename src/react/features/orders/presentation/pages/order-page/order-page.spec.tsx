import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CancelOrderApi } from '../../../../../../core/application/ports/cancel-order-api';
import { Order } from '../../../../../../core/domain/entities/order';
import { OrderLine } from '../../../../../../core/domain/value-objects/order-line';
import { OrderPage } from './order-page';

describe('OrderPage', () => {
  it('cancels the order through the existing application capability', async () => {
    const order = new Order('ORD-1002', 'Submitted', [new OrderLine('USB-C Hub', 1, 69.99)], 69.99);

    const orderApi: CancelOrderApi = {
      cancelOrder: vi.fn().mockResolvedValue(undefined),
    };

    const user = userEvent.setup();

    render(<OrderPage order={order} orderApi={orderApi} />);

    await user.click(
      screen.getByRole('button', {
        name: /cancel order/i,
      }),
    );

    expect(orderApi.cancelOrder).toHaveBeenCalledWith('ORD-1002');
    expect(order.status).toBe('Cancelled');
  });
});
