import { describe, expect, it } from 'vitest';

import { CancelOrderApi } from '../../core/application/ports/cancel-order-api';
import { createOrderApi } from './order-api';

describe('React OrderApi composition', () => {
  it('provides a REST cancellation capability without Angular', () => {
    const orderApi: CancelOrderApi = createOrderApi();

    expect(orderApi.cancelOrder).toBeTypeOf('function');
  });
});
