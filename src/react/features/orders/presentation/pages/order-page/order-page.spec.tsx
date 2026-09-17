import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OrderPage } from './order-page';

describe('OrderPage', () => {
  it('allows the customer to cancel a submitted order', async () => {
    const cancelOrder = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <OrderPage
        order={{
          id: 'ORD-1002',
          status: 'Submitted',
        }}
        cancelOrder={cancelOrder}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: /cancel order/i,
      }),
    );

    expect(cancelOrder).toHaveBeenCalledWith('ORD-1002');
  });
});
